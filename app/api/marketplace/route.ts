import { env } from "cloudflare:workers";

type ListingInput = Record<string, unknown>;

const publicListings = [
  { id: "garden", title: "Garden District Garage", address: "410 W 5th St", neighborhood: "Downtown Austin", hourlyRate: 8, type: "Covered garage", rating: 4.9, walkMinutes: 3, features: ["Covered", "In & out", "Cameras"], hostName: "Maya", latitude: 30.2688, longitude: -97.7465 },
  { id: "second", title: "2nd Street Driveway", address: "201 E 2nd St", neighborhood: "Downtown Austin", hourlyRate: 6, type: "Private driveway", rating: 5, walkMinutes: 5, features: ["Instant book", "Well lit"], hostName: "Charles", latitude: 30.2631, longitude: -97.7425 },
  { id: "otis", title: "The Otis Parking Deck", address: "1901 San Antonio St", neighborhood: "West Campus", hourlyRate: 10, type: "Covered garage", rating: 4.8, walkMinutes: 6, features: ["EV charging", "Attendant"], hostName: "Otis Parking", latitude: 30.2843, longitude: -97.7429 },
  { id: "congress", title: "Congress Ave Courtyard", address: "800 Congress Ave", neighborhood: "Downtown Austin", hourlyRate: 7, type: "Secure outdoor", rating: 4.7, walkMinutes: 7, features: ["24/7 access", "Well lit"], hostName: "Chris", latitude: 30.2702, longitude: -97.7423 },
];

const userId = (request: Request) => request.headers.get("oai-authenticated-user-id") ?? "local-development-user";
const accountInfo = (request: Request) => {
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  let displayName = encodedName ?? request.headers.get("oai-authenticated-user-email") ?? "Spotter member";
  if (encodedName && request.headers.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8") {
    try { displayName = decodeURIComponent(encodedName); } catch { displayName = encodedName; }
  }
  return { displayName: text(displayName, 80), email: text(request.headers.get("oai-authenticated-user-email"), 160) };
};
const now = () => new Date().toISOString();
const text = (value: unknown, max = 180) => String(value ?? "").trim().slice(0, max);
const localListing = (input: ListingInput) => {
  const title = text(input.title, 80); const address = text(input.address, 160); const hourlyRate = Number(input.hourlyRate);
  if (!title || !address || !Number.isFinite(hourlyRate) || hourlyRate < 1 || hourlyRate > 250) return null;
  return { id: crypto.randomUUID(), title, address, neighborhood: "Austin", hourlyRate: Math.round(hourlyRate), type: "Private driveway", rating: 4.8, walkMinutes: 6, features: ["Review required"], hostName: "You", status: "pending_review" };
};

async function resolveApprovedListing(id: string) {
  const seeded = publicListings.find((listing) => listing.id === id);
  if (seeded) return seeded;
  if (!env.DB) return null;
  const row = await env.DB.prepare("SELECT id, title, address, neighborhood, hourly_rate as hourlyRate, type, rating, walk_minutes as walkMinutes, features, host_name as hostName FROM listings WHERE id = ? AND status = 'approved'").bind(id).first<Record<string, unknown>>();
  if (!row) return null;
  return { ...row, hourlyRate: Number(row.hourlyRate), rating: Number(row.rating) / 10, walkMinutes: Number(row.walkMinutes), features: JSON.parse(String(row.features)) };
}

export async function GET(request: Request) {
  try {
    const user = userId(request);
    const [ownListings, bookings, verification] = await env.DB.batch([
      env.DB.prepare("SELECT id, title, address, neighborhood, hourly_rate as hourlyRate, type, features, host_name as hostName, rating, walk_minutes as walkMinutes, status FROM listings WHERE owner_id = ? ORDER BY created_at DESC").bind(user),
      env.DB.prepare("SELECT id, listing_title as listingTitle, address, starts_at as startsAt, ends_at as endsAt, amount_cents as amountCents, status FROM bookings WHERE renter_id = ? ORDER BY created_at DESC").bind(user),
      env.DB.prepare("SELECT status FROM verification_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").bind(user),
    ]);
    const rows = ownListings.results.map((row) => ({ ...row, rating: Number(row.rating) / 10, features: JSON.parse(String(row.features)) }));
    return Response.json({ listings: publicListings, ownListings: rows, bookings: bookings.results, verification: verification.results[0]?.status ?? "not_started", account: accountInfo(request) });
  } catch { return Response.json({ listings: publicListings, ownListings: [], bookings: [], verification: "not_started", account: accountInfo(request), persistence: "preview-fallback" }); }
}

export async function POST(request: Request) {
  let payload: { action?: string; listing?: ListingInput; reason?: unknown; propertyAuthority?: unknown } = {};
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 20000) return Response.json({ error: "Request is too large" }, { status: 413 });
    payload = await request.json() as typeof payload;
    const user = userId(request);
    if (payload.action === "create_booking") {
      const requestedId = text(payload.listing?.id, 80); const listing = await resolveApprovedListing(requestedId);
      if (!listing) return Response.json({ error: "That space is not available for booking" }, { status: 404 });
      const baseCents = Number(listing.hourlyRate) * 4 * 100; const serviceFeeCents = 240; const id = crypto.randomUUID(); const transactionId = crypto.randomUUID();
      const booking = { id, listingTitle: String(listing.title), address: String(listing.address), startsAt: "Today, 12:00 PM", endsAt: "Today, 4:00 PM", amountCents: baseCents + serviceFeeCents, status: "payment_required" };
      if (env.DB) await env.DB.batch([
        env.DB.prepare("INSERT INTO bookings (id, renter_id, listing_id, listing_title, address, starts_at, ends_at, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, user, requestedId, booking.listingTitle, booking.address, booking.startsAt, booking.endsAt, booking.amountCents, booking.status, now()),
        env.DB.prepare("INSERT INTO transactions (id, booking_id, payer_id, amount_cents, platform_fee_cents, status, provider, provider_payment_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(transactionId, id, user, booking.amountCents, serviceFeeCents, "requires_payment_method", "stripe_connect", null, now()),
      ]);
      return Response.json({ booking, transaction: { id: transactionId, status: "requires_payment_method", amountCents: booking.amountCents, provider: "stripe_connect" } }, { status: 201 });
    }
    if (payload.action === "create_listing") {
      const created = localListing(payload.listing ?? {});
      if (!created) return Response.json({ error: "Add a valid name, address, and hourly rate between $1 and $250" }, { status: 400 });
      if (env.DB) await env.DB.prepare("INSERT INTO listings (id, owner_id, title, address, neighborhood, hourly_rate, type, features, host_name, rating, walk_minutes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(created.id, user, created.title, created.address, created.neighborhood, created.hourlyRate, created.type, JSON.stringify(created.features), created.hostName, 48, created.walkMinutes, created.status, now()).run();
      return Response.json({ listing: created, persistence: env.DB ? "d1" : "preview-fallback" }, { status: 201 });
    }
    if (payload.action === "submit_verification") {
      const id = crypto.randomUUID(); const propertyAuthority = text(payload.propertyAuthority, 80) || "attestation_pending";
      if (env.DB) await env.DB.prepare("INSERT INTO verification_submissions (id, user_id, listing_id, status, property_authority, reviewer_note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, user, text(payload.listing?.id, 80) || null, "submitted", propertyAuthority, null, now()).run();
      return Response.json({ verification: { id, status: "submitted" }, persistence: env.DB ? "d1" : "preview-fallback" }, { status: 201 });
    }
    if (payload.action === "submit_report") {
      const listingId = text(payload.listing?.id, 80); const reason = text(payload.reason, 240);
      if (!listingId || !reason) return Response.json({ error: "A listing and reason are required" }, { status: 400 });
      const id = crypto.randomUUID(); if (env.DB) await env.DB.prepare("INSERT INTO reports (id, reporter_id, listing_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, user, listingId, reason, "open", now()).run();
      return Response.json({ report: { id, status: "open" }, persistence: env.DB ? "d1" : "preview-fallback" }, { status: 201 });
    }
    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    const listing = payload.listing ?? {};
    if (payload.action === "create_booking" && listing.id && listing.title && listing.address) {
      const rate = Number(listing.hourlyRate) || 0; return Response.json({ booking: { id: crypto.randomUUID(), listingTitle: text(listing.title), address: text(listing.address), startsAt: "Today, 12:00 PM", endsAt: "Today, 4:00 PM", amountCents: Math.round((rate * 4 + 2.4) * 100), status: "payment_required" }, persistence: "preview-fallback" }, { status: 201 });
    }
    if (payload.action === "create_listing") { const created = localListing(listing); if (created) return Response.json({ listing: created, persistence: "preview-fallback" }, { status: 201 }); }
    if (payload.action === "submit_verification") return Response.json({ verification: { id: crypto.randomUUID(), status: "submitted" }, persistence: "preview-fallback" }, { status: 201 });
    return Response.json({ error: "Marketplace storage is temporarily unavailable" }, { status: 503 });
  }
}

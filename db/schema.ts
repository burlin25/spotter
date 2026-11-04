import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), title: text("title").notNull(), address: text("address").notNull(), neighborhood: text("neighborhood").notNull(), hourlyRate: integer("hourly_rate").notNull(), type: text("type").notNull(), features: text("features").notNull(), hostName: text("host_name").notNull(), rating: integer("rating").notNull().default(48), walkMinutes: integer("walk_minutes").notNull().default(6), status: text("status").notNull().default("pending_review"), createdAt: text("created_at").notNull()
}, (table) => [index("idx_listings_owner_created").on(table.ownerId, table.createdAt)]);
export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(), renterId: text("renter_id").notNull(), listingId: text("listing_id").notNull(), listingTitle: text("listing_title").notNull(), address: text("address").notNull(), startsAt: text("starts_at").notNull(), endsAt: text("ends_at").notNull(), amountCents: integer("amount_cents").notNull(), status: text("status").notNull(), createdAt: text("created_at").notNull()
}, (table) => [index("idx_bookings_renter_created").on(table.renterId, table.createdAt)]);

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), bookingId: text("booking_id").notNull(), payerId: text("payer_id").notNull(), amountCents: integer("amount_cents").notNull(), platformFeeCents: integer("platform_fee_cents").notNull(), status: text("status").notNull(), provider: text("provider").notNull(), providerPaymentId: text("provider_payment_id"), createdAt: text("created_at").notNull()
}, (table) => [index("idx_transactions_payer_created").on(table.payerId, table.createdAt)]);

export const verificationSubmissions = sqliteTable("verification_submissions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), listingId: text("listing_id"), status: text("status").notNull(), propertyAuthority: text("property_authority").notNull(), reviewerNote: text("reviewer_note"), createdAt: text("created_at").notNull()
}, (table) => [index("idx_verification_user_created").on(table.userId, table.createdAt)]);

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(), reporterId: text("reporter_id").notNull(), listingId: text("listing_id").notNull(), reason: text("reason").notNull(), status: text("status").notNull(), createdAt: text("created_at").notNull()
}, (table) => [index("idx_reports_listing_created").on(table.listingId, table.createdAt)]);

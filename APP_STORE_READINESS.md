# Spotter release readiness

Spotter is a production-oriented web marketplace and installable PWA prototype. The code-side foundation is in place, but an App Store submission still requires external accounts, native packaging, and legal/compliance decisions.

## Completed in this workspace

- Mobile-first responsive marketplace UI with Explore, Trips, Host, Account, listing details, checkout, certification, and reporting flows.
- Installable PWA metadata (`manifest.webmanifest`), service-worker shell caching, mobile viewport configuration, and app icon metadata.
- Interactive OpenStreetMap preview with clickable parking markers, listing-level “Open in maps” links, and attribution.
- D1 persistence for listings, bookings, transaction ledger entries, verification submissions, and reports.
- Authenticated-user scoping via the platform identity header, with local-development fallback for preview mode.
- Server-side listing approval gate and booking price resolution; client-submitted price fields are not trusted.
- Host listings default to `pending_review` and are excluded from public search until a reviewer approves them.
- Input validation, request-size limit, safe fallback responses, and atomic booking/transaction creation.

## Required before accepting real money

1. Create a Stripe platform account and Connect onboarding flow. Add PaymentIntents, webhooks, refunds, cancellations, disputes, payout scheduling, tax handling, and idempotency keys. Never collect card or identity data directly in Spotter.
2. Add a production authentication provider and account/profile records (email or phone verification, recovery, device/session management, deletion/export requests).
3. Add image upload and moderation storage (R2 is not bound yet), plus signed URLs and retention rules.
4. Add time-zone aware availability, reservations/holds, double-booking prevention, cancellation policy, receipts, and host payout reconciliation.
5. Replace the pilot OpenStreetMap embed with a production map/geocoding/routing provider (for example Mapbox or Google Maps), including an API key, usage limits, billing alerts, attribution, and a privacy review.

## Required before App Store submission

- Wrap the web experience in a maintained native shell (Expo/React Native or Capacitor), with deep links, secure storage, push notifications, camera/photo permissions, and a real device QA matrix.
- Obtain Apple Developer and Google Play Console accounts, app identifiers, signing certificates, privacy manifests, store screenshots, descriptions, age rating, support URL, and privacy URL.
- Publish Terms of Service, Privacy Policy, host/renter rules, refund and dispute policy, insurance disclosure, accessibility statement, and data-retention/deletion process.
- Confirm local parking permits, landlord/HOA authorization, tax/merchant-of-record responsibilities, insurance coverage, and prohibited-space rules for every launch market.
- Configure maps/geocoding and fraud/safety monitoring, plus error tracking, audit logs, backups, alerting, analytics consent, and incident response.

## Release gates

- [ ] Stripe test mode: successful payment, failed payment, webhook retry, refund, dispute, and host payout reconciliation.
- [ ] D1/R2 production bindings and migration backup verified.
- [ ] Auth, account deletion, export, and support escalation tested.
- [ ] Listing certification review queue and moderation SLA staffed.
- [ ] Accessibility, security, privacy, load, and mobile device QA signed off.
- [ ] Native builds pass Apple/Google review requirements and staged rollout monitoring is ready.

The live private preview is intentionally not marketed as a finished App Store product until these account-dependent gates are complete.

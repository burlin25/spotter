CREATE INDEX `idx_bookings_renter_created` ON `bookings` (`renter_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_listings_owner_created` ON `listings` (`owner_id`,`created_at`);
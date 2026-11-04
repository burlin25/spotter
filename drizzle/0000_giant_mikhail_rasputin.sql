CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`renter_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`listing_title` text NOT NULL,
	`address` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`address` text NOT NULL,
	`neighborhood` text NOT NULL,
	`hourly_rate` integer NOT NULL,
	`type` text NOT NULL,
	`features` text NOT NULL,
	`host_name` text NOT NULL,
	`rating` integer DEFAULT 48 NOT NULL,
	`walk_minutes` integer DEFAULT 6 NOT NULL,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`created_at` text NOT NULL
);

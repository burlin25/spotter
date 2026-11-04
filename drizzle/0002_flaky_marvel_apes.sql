CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reports_listing_created` ON `reports` (`listing_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`payer_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`platform_fee_cents` integer NOT NULL,
	`status` text NOT NULL,
	`provider` text NOT NULL,
	`provider_payment_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_payer_created` ON `transactions` (`payer_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `verification_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text,
	`status` text NOT NULL,
	`property_authority` text NOT NULL,
	`reviewer_note` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_verification_user_created` ON `verification_submissions` (`user_id`,`created_at`);
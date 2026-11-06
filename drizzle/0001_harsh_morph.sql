CREATE TABLE `rooftop_presence` (
	`tab_id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`last_seen` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rooftop_presence_last_seen` ON `rooftop_presence` (`last_seen`);
CREATE TABLE `whispers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room` text NOT NULL,
	`body` text NOT NULL,
	`author` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `whispers_room_id` ON `whispers` (`room`,`id`);--> statement-breakpoint
CREATE INDEX `whispers_author_time` ON `whispers` (`author`,`created_at`);
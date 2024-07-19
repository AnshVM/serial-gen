CREATE TABLE `models` (
	`name` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`productName` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `serial_numbers` (
	`serial` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`sequence` integer NOT NULL,
	`created_at` integer NOT NULL,
	`model_name` text NOT NULL,
	FOREIGN KEY (`model_name`) REFERENCES `models`(`name`) ON UPDATE no action ON DELETE no action
);

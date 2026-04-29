CREATE TABLE `daily_waste_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryDate` date NOT NULL,
	`ingredientId` int NOT NULL,
	`quantityInput` decimal(10,2) NOT NULL,
	`notes` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_waste_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`unit` varchar(20) NOT NULL DEFAULT 'kg',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menu_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`nameEn` varchar(200),
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`mainIngredient` enum('meat','chicken','vegetables','bread'),
	`ingredientWeightGrams` int,
	`isAvailable` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_sales_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekStartDate` date NOT NULL,
	`weekEndDate` date NOT NULL,
	`menuItemId` int NOT NULL,
	`quantitySold` int NOT NULL DEFAULT 0,
	`totalRevenue` decimal(10,2) DEFAULT '0',
	`notes` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_sales_reports_id` PRIMARY KEY(`id`)
);

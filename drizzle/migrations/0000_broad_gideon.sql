CREATE TABLE `calculated_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`ingredientName` varchar(255) NOT NULL,
	`calculatedQuantity` decimal(10,3) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`sourceRecipeId` int,
	`sourceSaleId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calculated_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cash_closings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`employeeName` varchar(255) NOT NULL,
	`cashIn` decimal(10,2) DEFAULT '0',
	`cash` decimal(10,2) DEFAULT '0',
	`visa` decimal(10,2) DEFAULT '0',
	`total1` decimal(10,2),
	`expenses` decimal(10,2) DEFAULT '0',
	`systemReport` decimal(10,2),
	`cashCount` decimal(10,2) DEFAULT '0',
	`visaReport` decimal(10,2) DEFAULT '0',
	`visaWells` decimal(10,2) DEFAULT '0',
	`visaFoodOnTime` decimal(10,2) DEFAULT '0',
	`machineVisa` decimal(10,2) DEFAULT '0',
	`total2` decimal(10,2),
	`cashReport` decimal(10,2),
	`difference` decimal(10,2),
	`currencyBreakdown` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cash_closings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`ingredientName` varchar(255) NOT NULL,
	`totalInput` decimal(10,3),
	`totalUsed` decimal(10,3),
	`directWaste` decimal(10,3),
	`indirectWaste` decimal(10,3),
	`wastePercentage` decimal(5,2),
	`unit` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_statistics_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_statistics_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `inventory_input` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ingredientName` varchar(255) NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`totalPrice` decimal(10,2),
	`date` timestamp NOT NULL,
	`status` enum('good','damaged','expired') NOT NULL DEFAULT 'good',
	`supplier` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_input_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` int NOT NULL,
	`ingredientName` varchar(255) NOT NULL,
	`quantityPerUnit` decimal(10,3) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`wastePercentage` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipe_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dishName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `recipes_dishName_unique` UNIQUE(`dishName`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`time` varchar(10),
	`dishName` varchar(255) NOT NULL,
	`quantitySold` int NOT NULL,
	`unitPrice` decimal(10,2),
	`totalPrice` decimal(10,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `waste_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`ingredientName` varchar(255) NOT NULL,
	`alertType` varchar(100),
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`message` text NOT NULL,
	`suggestion` text,
	`isResolved` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `waste_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waste_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ingredientName` varchar(255) NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`wasteType` enum('direct','indirect') NOT NULL DEFAULT 'direct',
	`reason` varchar(255),
	`date` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waste_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `calculated_usage` ADD CONSTRAINT `calculated_usage_sourceRecipeId_recipes_id_fk` FOREIGN KEY (`sourceRecipeId`) REFERENCES `recipes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calculated_usage` ADD CONSTRAINT `calculated_usage_sourceSaleId_sales_id_fk` FOREIGN KEY (`sourceSaleId`) REFERENCES `sales`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recipe_ingredients` ADD CONSTRAINT `recipe_ingredients_recipeId_recipes_id_fk` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE no action ON UPDATE no action;
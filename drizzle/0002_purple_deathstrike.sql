CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '0',
	`unit` varchar(50) NOT NULL,
	`expiry_date` date NOT NULL,
	`storage_location` varchar(255),
	`notes` text,
	`status` enum('healthy','warning','urgent','expired') NOT NULL DEFAULT 'healthy',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipe_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipe_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`yield` decimal(10,2) NOT NULL DEFAULT '1',
	`yield_unit` varchar(50) NOT NULL,
	`cost_per_unit` decimal(10,2) DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`recipe_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`total_amount` decimal(12,2) NOT NULL,
	`sale_date` date NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waste_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int NOT NULL,
	`waste_percentage` decimal(5,2) NOT NULL,
	`threshold` decimal(5,2) NOT NULL DEFAULT '5',
	`status` enum('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
	`alert_date` date NOT NULL,
	`acknowledged_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `waste_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waste_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`reason` varchar(255) NOT NULL,
	`estimated_cost` decimal(10,2) DEFAULT '0',
	`waste_date` date NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waste_logs_id` PRIMARY KEY(`id`)
);

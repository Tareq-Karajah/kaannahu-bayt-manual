CREATE TABLE `daily_quantities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity_date` date NOT NULL,
	`quantity_withdrawn` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_quantities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dish_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dish_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity_per_serving` decimal(10,2) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dish_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dishes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dishes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`dish_id` int NOT NULL,
	`quantity` int NOT NULL,
	`sale_date` date NOT NULL,
	`sale_time` timestamp NOT NULL DEFAULT (now()),
	`total_price` decimal(10,2) NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waste_calculations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` int NOT NULL,
	`calculation_date` date NOT NULL,
	`quantity_withdrawn` decimal(10,2) NOT NULL,
	`quantity_consumed` decimal(10,2) NOT NULL,
	`waste_quantity` decimal(10,2) NOT NULL,
	`waste_percentage` decimal(5,2) NOT NULL,
	`estimated_cost` decimal(10,2) DEFAULT '0',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waste_calculations_id` PRIMARY KEY(`id`)
);

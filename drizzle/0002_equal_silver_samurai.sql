ALTER TABLE `daily_waste_entries` MODIFY COLUMN `entryDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `weekly_sales_reports` MODIFY COLUMN `weekStartDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `weekly_sales_reports` MODIFY COLUMN `weekEndDate` varchar(10) NOT NULL;
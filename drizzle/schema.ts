import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Menu categories (سندويشات، برغراتنا، الوجبات، الفطور، مقبلات ومزات، سلطات)
 */
export const menuCategories = mysqlTable("menu_categories", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = typeof menuCategories.$inferInsert;

/**
 * Menu items - all dishes from the restaurant menu
 */
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  /** Main ingredient type for waste tracking: meat, chicken, vegetables, bread */
  mainIngredient: mysqlEnum("mainIngredient", ["meat", "chicken", "vegetables", "bread"]),
  /** Weight of main ingredient in grams */
  ingredientWeightGrams: int("ingredientWeightGrams"),
  isAvailable: int("isAvailable").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Ingredients master list for waste tracking
 * Fixed 4 ingredients: اللحمة، الجاج، الخضرة، الخبز
 */
export const ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("kg"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

/**
 * Daily waste entry - records daily input quantities of each ingredient
 * User enters how much of each ingredient was used/received that day
 */
export const dailyWasteEntries = mysqlTable("daily_waste_entries", {
  id: int("id").autoincrement().primaryKey(),
  entryDate: varchar("entryDate", { length: 10 }).notNull(),
  ingredientId: int("ingredientId").notNull(),
  /** Quantity input (received/used) in kg */
  quantityInput: decimal("quantityInput", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyWasteEntry = typeof dailyWasteEntries.$inferSelect;
export type InsertDailyWasteEntry = typeof dailyWasteEntries.$inferInsert;

/**
 * Weekly sales reports - records weekly sales data per menu item
 * Used to compare input quantities vs sales to calculate waste
 */
export const weeklySalesReports = mysqlTable("weekly_sales_reports", {
  id: int("id").autoincrement().primaryKey(),
  /** Start date of the week (Sunday) */
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(),
  /** End date of the week (Saturday) */
  weekEndDate: varchar("weekEndDate", { length: 10 }).notNull(),
  menuItemId: int("menuItemId").notNull(),
  /** Number of units sold */
  quantitySold: int("quantitySold").notNull().default(0),
  /** Total revenue from this item */
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklySalesReport = typeof weeklySalesReports.$inferSelect;
export type InsertWeeklySalesReport = typeof weeklySalesReports.$inferInsert;

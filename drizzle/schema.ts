import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

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
 * Recipes Table - Store all dish recipes
 */
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  dishName: varchar("dishName", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Main Course", "Appetizer"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

/**
 * Recipe_Ingredients Table - Define ingredients for each recipe
 */
export const recipeIngredients = mysqlTable("recipe_ingredients", {
  id: int("id").autoincrement().primaryKey(),
  recipeId: int("recipeId").notNull().references(() => recipes.id),
  ingredientName: varchar("ingredientName", { length: 255 }).notNull(),
  quantityPerUnit: decimal("quantityPerUnit", { precision: 10, scale: 3 }).notNull(), // e.g., 0.250 kg per unit
  unit: varchar("unit", { length: 50 }).notNull(), // kg, piece, liter, etc.
  wastePercentage: decimal("wastePercentage", { precision: 5, scale: 2 }).default("0"), // e.g., 5% for cooking loss
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = typeof recipeIngredients.$inferInsert;

/**
 * Sales Table - Track daily sales
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  time: varchar("time", { length: 10 }), // HH:MM format
  dishName: varchar("dishName", { length: 255 }).notNull(),
  quantitySold: int("quantitySold").notNull(), // number of units sold
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Inventory_Input Table - Track incoming ingredients
 */
export const inventoryInput = mysqlTable("inventory_input", {
  id: int("id").autoincrement().primaryKey(),
  ingredientName: varchar("ingredientName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // kg, piece, liter, etc.
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["good", "damaged", "expired"]).default("good").notNull(),
  supplier: varchar("supplier", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryInput = typeof inventoryInput.$inferSelect;
export type InsertInventoryInput = typeof inventoryInput.$inferInsert;

/**
 * Calculated_Usage Table - Auto-calculated ingredient consumption based on sales
 * Formula: calculated_quantity = quantity_sold × quantity_per_unit × (1 + waste_percentage)
 */
export const calculatedUsage = mysqlTable("calculated_usage", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  ingredientName: varchar("ingredientName", { length: 255 }).notNull(),
  calculatedQuantity: decimal("calculatedQuantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  sourceRecipeId: int("sourceRecipeId").references(() => recipes.id),
  sourceSaleId: int("sourceSaleId").references(() => sales.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculatedUsage = typeof calculatedUsage.$inferSelect;
export type InsertCalculatedUsage = typeof calculatedUsage.$inferInsert;

/**
 * Waste_Log Table - Track direct waste (damaged, expired, preparation errors)
 */
export const wasteLog = mysqlTable("waste_log", {
  id: int("id").autoincrement().primaryKey(),
  ingredientName: varchar("ingredientName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  wasteType: mysqlEnum("wasteType", ["direct", "indirect"]).default("direct").notNull(),
  reason: varchar("reason", { length: 255 }), // expired, damaged, preparation_error, theft_suspected, etc.
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WasteLog = typeof wasteLog.$inferSelect;
export type InsertWasteLog = typeof wasteLog.$inferInsert;

/**
 * Daily_Statistics Table - Pre-calculated daily stats for performance
 */
export const dailyStatistics = mysqlTable("daily_statistics", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull().unique(),
  ingredientName: varchar("ingredientName", { length: 255 }).notNull(),
  totalInput: decimal("totalInput", { precision: 10, scale: 3 }), // sum of inventory input
  totalUsed: decimal("totalUsed", { precision: 10, scale: 3 }), // sum of calculated usage
  directWaste: decimal("directWaste", { precision: 10, scale: 3 }), // sum of waste_log (direct)
  indirectWaste: decimal("indirectWaste", { precision: 10, scale: 3 }), // calculated: input - used - direct_waste
  wastePercentage: decimal("wastePercentage", { precision: 5, scale: 2 }), // (total_waste / total_input) × 100
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyStatistics = typeof dailyStatistics.$inferSelect;
export type InsertDailyStatistics = typeof dailyStatistics.$inferInsert;

/**
 * Waste_Alerts Table - Smart alerts for waste anomalies
 */
export const wasteAlerts = mysqlTable("waste_alerts", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  ingredientName: varchar("ingredientName", { length: 255 }).notNull(),
  alertType: varchar("alertType", { length: 100 }), // high_waste, frequent_expiration, mismatch, etc.
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  message: text("message").notNull(),
  suggestion: text("suggestion"), // actionable recommendation
  isResolved: int("isResolved").default(0), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type WasteAlert = typeof wasteAlerts.$inferSelect;
export type InsertWasteAlert = typeof wasteAlerts.$inferInsert;

/**
 * Cash Closing Table - Daily cash reconciliation
 */
export const cashClosings = mysqlTable("cash_closings", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  cashIn: decimal("cashIn", { precision: 10, scale: 2 }).default("0"),
  cash: decimal("cash", { precision: 10, scale: 2 }).default("0"),
  visa: decimal("visa", { precision: 10, scale: 2 }).default("0"),
  total1: decimal("total1", { precision: 10, scale: 2 }), // cash_in + cash + visa
  expenses: decimal("expenses", { precision: 10, scale: 2 }).default("0"),
  systemReport: decimal("systemReport", { precision: 10, scale: 2 }), // total1 - expenses
  cashCount: decimal("cashCount", { precision: 10, scale: 2 }).default("0"), // عد الجرار
  visaReport: decimal("visaReport", { precision: 10, scale: 2 }).default("0"),
  visaWells: decimal("visaWells", { precision: 10, scale: 2 }).default("0"),
  visaFoodOnTime: decimal("visaFoodOnTime", { precision: 10, scale: 2 }).default("0"),
  machineVisa: decimal("machineVisa", { precision: 10, scale: 2 }).default("0"),
  total2: decimal("total2", { precision: 10, scale: 2 }), // sum of visa reports
  cashReport: decimal("cashReport", { precision: 10, scale: 2 }), // cash_count + total2
  difference: decimal("difference", { precision: 10, scale: 2 }), // cash_report - system_report
  currencyBreakdown: json("currencyBreakdown"), // {shekel: {...}, dollar: {...}, dinar: {...}}
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashClosing = typeof cashClosings.$inferSelect;
export type InsertCashClosing = typeof cashClosings.$inferInsert;

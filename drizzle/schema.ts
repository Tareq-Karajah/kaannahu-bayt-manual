import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

// Cash Closing Records Table
export const cashClosings = mysqlTable("cash_closings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  employeeName: varchar("employee_name", { length: 255 }).notNull(),
  closingDate: date("closing_date").notNull(),
  closingTime: timestamp("closing_time").defaultNow().notNull(),

  // Section 1: Cash In & System Report
  cashIn: decimal("cash_in", { precision: 10, scale: 2 }).default("0").notNull(),
  cash: decimal("cash", { precision: 10, scale: 2 }).default("0").notNull(),
  visa: decimal("visa", { precision: 10, scale: 2 }).default("0").notNull(),
  total1: decimal("total_1", { precision: 10, scale: 2 }).default("0").notNull(),
  expenses: decimal("expenses", { precision: 10, scale: 2 }).default("0").notNull(),
  systemReport: decimal("system_report", { precision: 10, scale: 2 }).default("0").notNull(),

  // Section 2: Cash Count & Visa Report
  cashCountTotal: decimal("cash_count_total", { precision: 10, scale: 2 }).default("0").notNull(),
  visaMachineReport: decimal("visa_machine_report", { precision: 10, scale: 2 }).default("0").notNull(),
  visaWellsReport: decimal("visa_wells_report", { precision: 10, scale: 2 }).default("0").notNull(),
  visaFoodOnTimeReport: decimal("visa_food_on_time_report", { precision: 10, scale: 2 }).default("0").notNull(),
  total2: decimal("total_2", { precision: 10, scale: 2 }).default("0").notNull(),
  cashReport: decimal("cash_report", { precision: 10, scale: 2 }).default("0").notNull(),
  difference: decimal("difference", { precision: 10, scale: 2 }).default("0").notNull(),

  // Currency Breakdown
  shekelNotes200: int("shekel_notes_200").default(0),
  shekelNotes100: int("shekel_notes_100").default(0),
  shekelNotes50: int("shekel_notes_50").default(0),
  shekelNotes20: int("shekel_notes_20").default(0),
  shekelNotes10: int("shekel_notes_10").default(0),
  shekelNotes5: int("shekel_notes_5").default(0),
  shekelCoins2: int("shekel_coins_2").default(0),
  shekelCoins1: int("shekel_coins_1").default(0),
  shekelCoins05: int("shekel_coins_05").default(0),
  dollarAmount: decimal("dollar_amount", { precision: 10, scale: 2 }).default("0"),
  dinarAmount: decimal("dinar_amount", { precision: 10, scale: 2 }).default("0"),

  // Status
  status: mysqlEnum("status", ["balanced", "difference", "pending"]).default("pending").notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CashClosing = typeof cashClosings.$inferSelect;
export type InsertCashClosing = typeof cashClosings.$inferInsert;

// Daily Statistics Table
export const dailyStatistics = mysqlTable("daily_statistics", {
  id: int("id").autoincrement().primaryKey(),
  statisticsDate: date("statistics_date").notNull().unique(),
  
  // Sales & Revenue
  totalCashIn: decimal("total_cash_in", { precision: 12, scale: 2 }).default("0").notNull(),
  totalCash: decimal("total_cash", { precision: 12, scale: 2 }).default("0").notNull(),
  totalVisa: decimal("total_visa", { precision: 12, scale: 2 }).default("0").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  
  // Expenses & Differences
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }).default("0").notNull(),
  totalDifferences: decimal("total_differences", { precision: 12, scale: 2 }).default("0").notNull(),
  balancedClosings: int("balanced_closings").default(0),
  differenceClosings: int("difference_closings").default(0),
  
  // Metrics
  averageDifference: decimal("average_difference", { precision: 10, scale: 2 }).default("0"),
  maxDifference: decimal("max_difference", { precision: 10, scale: 2 }).default("0"),
  minDifference: decimal("min_difference", { precision: 10, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DailyStatistics = typeof dailyStatistics.$inferSelect;
export type InsertDailyStatistics = typeof dailyStatistics.$inferInsert;
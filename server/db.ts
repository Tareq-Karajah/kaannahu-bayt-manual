import { eq, and, gte, lte, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Recipe functions
export async function getRecipes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.recipes);
}

export async function getRecipeWithIngredients(recipeId: number) {
  const db = await getDb();
  if (!db) return null;
  const recipe = await db.select().from(schema.recipes).where(eq(schema.recipes.id, recipeId)).limit(1);
  if (!recipe.length) return null;
  const ingredients = await db.select().from(schema.recipeIngredients).where(eq(schema.recipeIngredients.recipeId, recipeId));
  return { ...recipe[0], ingredients };
}

// Sales functions
export async function recordSale(sale: schema.InsertSale) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(schema.sales).values(sale);
  return result;
}

// Inventory functions
export async function recordInventoryInput(input: schema.InsertInventoryInput) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(schema.inventoryInput).values(input);
}

// Calculated Usage functions
export async function recordCalculatedUsage(usage: schema.InsertCalculatedUsage) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(schema.calculatedUsage).values(usage);
}

// Waste Log functions
export async function recordWaste(waste: schema.InsertWasteLog) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(schema.wasteLog).values(waste);
}

// Statistics functions
export async function getDailyStatistics(date: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.dailyStatistics).where(eq(schema.dailyStatistics.date, date));
}

export async function getWasteAlerts(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.wasteAlerts)
    .where(and(
      gte(schema.wasteAlerts.date, startDate),
      lte(schema.wasteAlerts.date, endDate)
    ));
}

// Cash Closing functions
export async function recordCashClosing(closing: schema.InsertCashClosing) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(schema.cashClosings).values(closing);
}

export async function getCashClosings(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.cashClosings)
    .where(and(
      gte(schema.cashClosings.date, startDate),
      lte(schema.cashClosings.date, endDate)
    ));
}

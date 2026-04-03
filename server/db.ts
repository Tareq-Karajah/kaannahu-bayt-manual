import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, cashClosings, dailyStatistics, InsertCashClosing, CashClosing, DailyStatistics, products, recipes, sales, wasteLogs, wasteAlerts } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Cash Closing Functions
export async function saveCashClosing(data: InsertCashClosing): Promise<CashClosing> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(cashClosings).values(data);
  const id = result[0].insertId;
  
  const saved = await db.select().from(cashClosings).where(eq(cashClosings.id, Number(id))).limit(1);
  return saved[0];
}

export async function getCashClosingsByDate(date: Date, userId?: number): Promise<CashClosing[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const dateStr = date.toISOString().split('T')[0];
  let query = db.select().from(cashClosings).where(eq(cashClosings.closingDate, dateStr as any));
  
  if (userId) {
    query = db.select().from(cashClosings).where(and(eq(cashClosings.closingDate, dateStr as any), eq(cashClosings.userId, userId)));
  }
  
  return query.orderBy(desc(cashClosings.closingTime));
}

export async function getCashClosingHistory(userId: number, limit: number = 30): Promise<CashClosing[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(cashClosings).where(eq(cashClosings.userId, userId)).orderBy(desc(cashClosings.closingDate)).limit(limit);
}

// Daily Statistics Functions
export async function updateDailyStatistics(date: Date): Promise<DailyStatistics> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const dateStr = date.toISOString().split('T')[0];
  const closingsForDay = await db.select().from(cashClosings).where(eq(cashClosings.closingDate, dateStr as any));
  
  if (closingsForDay.length === 0) {
    throw new Error("No cash closings found for this date");
  }

  const stats = {
    totalCashIn: closingsForDay.reduce((sum, c) => sum + parseFloat(c.cashIn.toString()), 0).toString(),
    totalCash: closingsForDay.reduce((sum, c) => sum + parseFloat(c.cash.toString()), 0).toString(),
    totalVisa: closingsForDay.reduce((sum, c) => sum + parseFloat(c.visa.toString()), 0).toString(),
    totalRevenue: closingsForDay.reduce((sum, c) => sum + parseFloat(c.total1.toString()), 0).toString(),
    totalExpenses: closingsForDay.reduce((sum, c) => sum + parseFloat(c.expenses.toString()), 0).toString(),
    totalDifferences: closingsForDay.reduce((sum, c) => sum + parseFloat(c.difference.toString()), 0).toString(),
    balancedClosings: closingsForDay.filter(c => c.status === 'balanced').length,
    differenceClosings: closingsForDay.filter(c => c.status === 'difference').length,
    averageDifference: (closingsForDay.length > 0 ? closingsForDay.reduce((sum, c) => sum + parseFloat(c.difference.toString()), 0) / closingsForDay.length : 0).toString(),
    maxDifference: Math.max(...closingsForDay.map(c => parseFloat(c.difference.toString()))).toString(),
    minDifference: Math.min(...closingsForDay.map(c => parseFloat(c.difference.toString()))).toString(),
  };

  const existing = await db.select().from(dailyStatistics).where(eq(dailyStatistics.statisticsDate, dateStr as any)).limit(1);
  
  if (existing.length > 0) {
    await db.update(dailyStatistics).set(stats).where(eq(dailyStatistics.statisticsDate, dateStr as any));
    return (await db.select().from(dailyStatistics).where(eq(dailyStatistics.statisticsDate, dateStr as any)).limit(1))[0];
  } else {
    const result = await db.insert(dailyStatistics).values({ statisticsDate: dateStr as any, ...stats } as any);
    const id = result[0].insertId;
    return (await db.select().from(dailyStatistics).where(eq(dailyStatistics.id, Number(id))).limit(1))[0];
  }
}

export async function getDailyStatistics(startDate: Date, endDate: Date): Promise<DailyStatistics[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  return db.select().from(dailyStatistics).where(and(gte(dailyStatistics.statisticsDate, startStr as any), lte(dailyStatistics.statisticsDate, endStr as any))).orderBy(desc(dailyStatistics.statisticsDate));
}

// Product Functions
export async function saveProduct(data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(products).values(data);
  const id = result[0].insertId;
  
  const saved = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  return saved[0];
}

export async function getProducts(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.expiryDate));
}

export async function updateProduct(id: number, data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(products).set(data).where(eq(products.id, id));
  const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return updated[0];
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(products).where(eq(products.id, id));
}

// Recipe Functions
export async function saveRecipe(data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(recipes).values(data);
  const id = result[0].insertId;
  
  const saved = await db.select().from(recipes).where(eq(recipes.id, Number(id))).limit(1);
  return saved[0];
}

export async function getRecipes(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(recipes).where(eq(recipes.userId, userId)).orderBy(desc(recipes.createdAt));
}

// Sales Functions
export async function saveSale(data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(sales).values(data);
  const id = result[0].insertId;
  
  const saved = await db.select().from(sales).where(eq(sales.id, Number(id))).limit(1);
  return saved[0];
}

export async function getSales(userId: number, startDate?: Date, endDate?: Date): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  let query = db.select().from(sales).where(eq(sales.userId, userId));
  
  if (startDate && endDate) {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    query = db.select().from(sales).where(and(
      eq(sales.userId, userId),
      gte(sales.saleDate, startStr as any),
      lte(sales.saleDate, endStr as any)
    ));
  }
  
  return query.orderBy(desc(sales.saleDate));
}

// Waste Log Functions
export async function saveWasteLog(data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(wasteLogs).values(data);
  const id = result[0].insertId;
  
  const saved = await db.select().from(wasteLogs).where(eq(wasteLogs.id, Number(id))).limit(1);
  return saved[0];
}

export async function getWasteLogs(userId: number, startDate?: Date, endDate?: Date): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  let query = db.select().from(wasteLogs).where(eq(wasteLogs.userId, userId));
  
  if (startDate && endDate) {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    query = db.select().from(wasteLogs).where(and(
      eq(wasteLogs.userId, userId),
      gte(wasteLogs.wasteDate, startStr as any),
      lte(wasteLogs.wasteDate, endStr as any)
    ));
  }
  
  return query.orderBy(desc(wasteLogs.wasteDate));
}

// Waste Alert Functions
export async function saveWasteAlert(data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(wasteAlerts).values(data);
  const id = result[0].insertId;
  
  const saved = await db.select().from(wasteAlerts).where(eq(wasteAlerts.id, Number(id))).limit(1);
  return saved[0];
}

export async function getWasteAlerts(userId: number, status?: string): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  let query = db.select().from(wasteAlerts).where(eq(wasteAlerts.userId, userId));
  
  if (status) {
    query = db.select().from(wasteAlerts).where(and(
      eq(wasteAlerts.userId, userId),
      eq(wasteAlerts.status, status as any)
    ));
  }
  
  return query.orderBy(desc(wasteAlerts.alertDate));
}


export async function deleteCashClosing(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(cashClosings).where(eq(cashClosings.id, id));
}


export async function updateWasteLog(id: number, data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(wasteLogs).set(data).where(eq(wasteLogs.id, id));
  const updated = await db.select().from(wasteLogs).where(eq(wasteLogs.id, id)).limit(1);
  return updated[0];
}

export async function deleteWasteLog(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(wasteLogs).where(eq(wasteLogs.id, id));
}

export async function updateWasteAlert(id: number, data: any): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(wasteAlerts).set(data).where(eq(wasteAlerts.id, id));
  const updated = await db.select().from(wasteAlerts).where(eq(wasteAlerts.id, id)).limit(1);
  return updated[0];
}

export async function deleteWasteAlert(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(wasteAlerts).where(eq(wasteAlerts.id, id));
}

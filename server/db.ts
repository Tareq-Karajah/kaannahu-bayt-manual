import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, cashClosings, dailyStatistics, InsertCashClosing, CashClosing, DailyStatistics } from "../drizzle/schema";
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

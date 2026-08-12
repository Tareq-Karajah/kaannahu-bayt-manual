import { describe, it, expect, beforeAll } from "vitest";
import { saveCashClosing, getCashClosingHistory } from "./db";
import { InsertCashClosing } from "../drizzle/schema";

describe("Cash Closing Persistence", () => {
  const testUserId = 1;
  const testDate = new Date().toISOString().split('T')[0];

  beforeAll(async () => {
    // Ensure database is available
    const { getDb } = await import("./db");
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available for testing");
    }
  });

  it("should save a cash closing record to database", async () => {
    const testRecord: InsertCashClosing = {
      userId: testUserId,
      employeeName: "Test Employee",
      closingDate: testDate as any,
      closingTime: new Date(),
      cashIn: "1000",
      cash: "500",
      visa: "200",
      total1: "1700",
      expenses: "100",
      systemReport: "1600",
      cashCountTotal: "700",
      visaMachineReport: "100",
      visaWellsReport: "50",
      visaFoodOnTimeReport: "50",
      total2: "200",
      cashReport: "900",
      difference: "-700",
      shekelNotes200: 5,
      shekelNotes100: 0,
      shekelNotes50: 0,
      shekelNotes20: 0,
      shekelNotes10: 0,
      shekelNotes5: 0,
      shekelCoins2: 11,
      shekelCoins1: 13,
      shekelCoins05: 0,
      dollarAmount: "0",
      dinarAmount: "0",
      status: "difference",
      notes: "Test record",
    };

    const saved = await saveCashClosing(testRecord);
    expect(saved).toBeDefined();
    expect(saved.id).toBeDefined();
    expect(saved.employeeName).toBe("Test Employee");
    // Database returns decimal format
    expect(saved.cashIn).toMatch(/^1000(\.0+)?$/);
    expect(saved.shekelCoins2).toBe(11);
    expect(saved.shekelCoins1).toBe(13);
  });

  it("should retrieve cash closing records from database", async () => {
    const records = await getCashClosingHistory(testUserId, 10);
    expect(Array.isArray(records)).toBe(true);
    
    // Should have at least one record from the previous test
    if (records.length > 0) {
      expect(records[0].employeeName).toBeDefined();
      expect(records[0].closingDate).toBeDefined();
    }
  });

  it("should persist data across multiple retrievals", async () => {
    // First retrieval
    const records1 = await getCashClosingHistory(testUserId, 10);
    const count1 = records1.length;

    // Second retrieval (simulating page refresh)
    const records2 = await getCashClosingHistory(testUserId, 10);
    const count2 = records2.length;

    // Count should be the same
    expect(count1).toBe(count2);
    
    // Data should be identical
    if (count1 > 0) {
      expect(records1[0].id).toBe(records2[0].id);
      expect(records1[0].employeeName).toBe(records2[0].employeeName);
      expect(records1[0].cashIn).toBe(records2[0].cashIn);
    }
  });

  it("should save and retrieve multiple records", async () => {
    const records = await getCashClosingHistory(testUserId, 100);
    const initialCount = records.length;

    // Save a new record
    const newRecord: InsertCashClosing = {
      userId: testUserId,
      employeeName: "Another Employee",
      closingDate: testDate as any,
      closingTime: new Date(),
      cashIn: "2000",
      cash: "1000",
      visa: "500",
      total1: "3500",
      expenses: "200",
      systemReport: "3300",
      cashCountTotal: "1500",
      visaMachineReport: "200",
      visaWellsReport: "150",
      visaFoodOnTimeReport: "150",
      total2: "500",
      cashReport: "2000",
      difference: "-1300",
      shekelNotes200: 10,
      shekelNotes100: 0,
      shekelNotes50: 0,
      shekelNotes20: 0,
      shekelNotes10: 0,
      shekelNotes5: 0,
      shekelCoins2: 0,
      shekelCoins1: 0,
      shekelCoins05: 0,
      dollarAmount: "0",
      dinarAmount: "0",
      status: "difference",
      notes: "Another test record",
    };

    await saveCashClosing(newRecord);

    // Retrieve again
    const updatedRecords = await getCashClosingHistory(testUserId, 100);
    expect(updatedRecords.length).toBeGreaterThanOrEqual(initialCount + 1);
  });
});

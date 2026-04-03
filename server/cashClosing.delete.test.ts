import { describe, it, expect } from "vitest";
import { saveCashClosing, getCashClosingHistory, deleteCashClosing } from "./db";
import { InsertCashClosing } from "../drizzle/schema";

describe("Cash Closing Delete", () => {
  const testUserId = 1;
  const testDate = new Date().toISOString().split('T')[0];

  it("should delete a cash closing record from database", async () => {
    // Create a test record
    const testRecord: InsertCashClosing = {
      userId: testUserId,
      employeeName: "Delete Test Employee",
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
      shekelCoins2: 0,
      shekelCoins1: 0,
      shekelCoins05: 0,
      dollarAmount: "0",
      dinarAmount: "0",
      status: "difference",
      notes: "Test record for deletion",
    };

    // Save the record
    const saved = await saveCashClosing(testRecord);
    expect(saved.id).toBeDefined();
    const recordId = saved.id;

    // Verify it was saved
    const recordsBefore = await getCashClosingHistory(testUserId, 100);
    const foundBefore = recordsBefore.find((r) => r.id === recordId);
    expect(foundBefore).toBeDefined();

    // Delete the record
    await deleteCashClosing(recordId);

    // Verify it was deleted
    const recordsAfter = await getCashClosingHistory(testUserId, 100);
    const foundAfter = recordsAfter.find((r) => r.id === recordId);
    expect(foundAfter).toBeUndefined();
  });

  it("should not affect other records when deleting", async () => {
    // Create two test records
    const record1: InsertCashClosing = {
      userId: testUserId,
      employeeName: "Delete Test 1",
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
      shekelCoins2: 0,
      shekelCoins1: 0,
      shekelCoins05: 0,
      dollarAmount: "0",
      dinarAmount: "0",
      status: "difference",
      notes: "Test record 1",
    };

    const record2: InsertCashClosing = {
      userId: testUserId,
      employeeName: "Delete Test 2",
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
      notes: "Test record 2",
    };

    const saved1 = await saveCashClosing(record1);
    const saved2 = await saveCashClosing(record2);

    // Delete the first record
    await deleteCashClosing(saved1.id);

    // Verify the second record still exists
    const records = await getCashClosingHistory(testUserId, 100);
    const found1 = records.find((r) => r.id === saved1.id);
    const found2 = records.find((r) => r.id === saved2.id);

    expect(found1).toBeUndefined();
    expect(found2).toBeDefined();
    expect(found2?.employeeName).toBe("Delete Test 2");
  });
});

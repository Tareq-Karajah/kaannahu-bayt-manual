import { describe, it, expect } from "vitest";
import { saveWasteLog, getWasteLogs, saveWasteAlert, getWasteAlerts, saveProduct } from "./db";

describe("Waste Tracking System", () => {
  const testUserId = 1;
  const testDate = new Date().toISOString().split('T')[0];

  it("should save and retrieve waste logs", async () => {
    // First, create a product
    const product = await saveProduct({
      userId: testUserId,
      name: "Test Product for Waste",
      category: "test",
      quantity: 100,
      unit: "kg",
      costPerUnit: 10,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Save a waste log
    const wasteLog = await saveWasteLog({
      userId: testUserId,
      productId: product.id,
      quantity: "5",
      unit: "kg",
      reason: "تلف",
      estimatedCost: 50,
      wasteDate: testDate as any,
      notes: "Test waste log",
    });

    expect(wasteLog.id).toBeDefined();
    expect(parseFloat(wasteLog.quantity.toString())).toBe(5);
    expect(wasteLog.reason).toBe("تلف");

    // Retrieve waste logs
    const logs = await getWasteLogs(testUserId);
    const foundLog = logs.find((l) => l.id === wasteLog.id);

    expect(foundLog).toBeDefined();
    expect(foundLog?.productId).toBe(product.id);
    expect(parseFloat(foundLog?.quantity.toString() || "0")).toBe(5);
  });

  it("should create and retrieve waste alerts", async () => {
    // First, create a product
    const product = await saveProduct({
      userId: testUserId,
      name: "Test Product for Alert",
      category: "test",
      quantity: 100,
      unit: "kg",
      costPerUnit: 10,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create a waste alert
    const alert = await saveWasteAlert({
      userId: testUserId,
      productId: product.id,
      wastePercentage: "15",
      threshold: "10",
      status: "active",
      alertDate: testDate as any,
      notes: "High waste percentage",
    });

    expect(alert.id).toBeDefined();
    expect(alert.status).toBe("active");
    expect(parseFloat(alert.wastePercentage.toString())).toBe(15);

    // Retrieve alerts
    const alerts = await getWasteAlerts(testUserId);
    const foundAlert = alerts.find((a) => a.id === alert.id);

    expect(foundAlert).toBeDefined();
    expect(foundAlert?.productId).toBe(product.id);
    expect(foundAlert?.status).toBe("active");
    expect(parseFloat(foundAlert?.wastePercentage.toString() || "0")).toBe(15);
  });

  it("should calculate waste statistics correctly", async () => {
    // Create a product
    const product = await saveProduct({
      userId: testUserId,
      name: "Test Product for Stats",
      category: "test",
      quantity: 100,
      unit: "kg",
      costPerUnit: 10,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Save multiple waste logs
    await saveWasteLog({
      userId: testUserId,
      productId: product.id,
      quantity: "5",
      unit: "kg",
      reason: "تلف",
      estimatedCost: 50,
      wasteDate: testDate as any,
    });

    await saveWasteLog({
      userId: testUserId,
      productId: product.id,
      quantity: "3",
      unit: "kg",
      reason: "انتهاء صلاحية",
      estimatedCost: 30,
      wasteDate: testDate as any,
    });

    // Retrieve logs
    const logs = await getWasteLogs(testUserId);
    const productLogs = logs.filter((l) => l.productId === product.id);

    // Calculate totals
    const totalQuantity = productLogs.reduce((sum, log) => sum + parseFloat(log.quantity.toString()), 0);
    const totalCost = productLogs.reduce((sum, log) => sum + parseFloat(log.estimatedCost?.toString() || "0"), 0);

    expect(totalQuantity).toBeCloseTo(8, 1);
    expect(totalCost).toBeCloseTo(80, 1);
  });

  it("should filter waste logs by date range", async () => {
    // Create a product
    const product = await saveProduct({
      userId: testUserId,
      name: "Test Product for Date Filter",
      category: "test",
      quantity: 100,
      unit: "kg",
      costPerUnit: 10,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Save waste logs with different dates
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    await saveWasteLog({
      userId: testUserId,
      productId: product.id,
      quantity: "1",
      unit: "kg",
      reason: "تلف",
      wasteDate: yesterday.toISOString().split('T')[0] as any,
    });

    await saveWasteLog({
      userId: testUserId,
      productId: product.id,
      quantity: "2",
      unit: "kg",
      reason: "تلف",
      wasteDate: today.toISOString().split('T')[0] as any,
    });

    // Retrieve logs for today only
    const logsForToday = await getWasteLogs(testUserId, today, today);
    const todayLogs = logsForToday.filter((l) => l.productId === product.id);

    expect(todayLogs.length).toBeGreaterThanOrEqual(1);
  });
});

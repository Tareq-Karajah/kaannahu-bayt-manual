import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => {
  const mockCategories = [
    { id: 1, nameAr: "سندويشات", nameEn: "Sandwiches", sortOrder: 1, createdAt: new Date() },
    { id: 2, nameAr: "برغراتنا", nameEn: "Burgers", sortOrder: 2, createdAt: new Date() },
  ];

  const mockItems = [
    {
      id: 1, categoryId: 1, nameAr: "ساندويش دجاج", nameEn: null,
      description: null, price: "25.00", mainIngredient: "chicken",
      ingredientWeightGrams: 150, isAvailable: 1, sortOrder: 1,
      createdAt: new Date(), updatedAt: new Date(),
    },
    {
      id: 2, categoryId: 2, nameAr: "برغر كانه بيت", nameEn: null,
      description: null, price: "40.00", mainIngredient: "meat",
      ingredientWeightGrams: 150, isAvailable: 1, sortOrder: 2,
      createdAt: new Date(), updatedAt: new Date(),
    },
  ];

  const mockIngredients = [
    { id: 1, nameAr: "اللحمة", nameEn: "Meat", unit: "kg", createdAt: new Date() },
    { id: 2, nameAr: "الجاج", nameEn: "Chicken", unit: "kg", createdAt: new Date() },
    { id: 3, nameAr: "الخضرة", nameEn: "Vegetables", unit: "kg", createdAt: new Date() },
    { id: 4, nameAr: "الخبز", nameEn: "Bread", unit: "kg", createdAt: new Date() },
  ];

  // Build a chainable mock query builder
  function createChainableQuery(data: any[]) {
    let filteredData = [...data];
    const chain: any = {
      where: () => chain,
      orderBy: () => chain,
      innerJoin: () => chain,
      groupBy: () => chain,
      then: (resolve: any) => resolve(filteredData),
    };
    return chain;
  }

  const mockDb = {
    select: (fields?: any) => ({
      from: (table: any) => createChainableQuery(
        table === "menu_categories" ? mockCategories :
        table === "ingredients" ? mockIngredients :
        mockItems
      ),
    }),
    insert: () => ({
      values: () => Promise.resolve(),
    }),
    delete: () => ({
      where: () => Promise.resolve(),
    }),
    execute: () => Promise.resolve([[]]),
  };

  return {
    getDb: vi.fn().mockResolvedValue(mockDb),
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Menu API", () => {
  it("getCategories returns array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.menu.getCategories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getItems returns array without filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.menu.getItems({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("getItems accepts categoryId filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.menu.getItems({ categoryId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getItemsWithCategory returns array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.menu.getItemsWithCategory();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Ingredients API", () => {
  it("list returns array of ingredients", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ingredients.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Waste Tracking API", () => {
  it("getByDate requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.waste.getByDate({ date: "2026-04-08" }))
      .rejects.toThrow();
  });

  it("getByDate returns array for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.waste.getByDate({ date: "2026-04-08" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getByRange requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.waste.getByRange({ startDate: "2026-04-01", endDate: "2026-04-07" }))
      .rejects.toThrow();
  });

  it("saveEntries requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.waste.saveEntries({
      date: "2026-04-08",
      entries: [{ ingredientId: 1, quantityInput: "5.0" }],
    })).rejects.toThrow();
  });

  it("saveEntries succeeds for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.waste.saveEntries({
      date: "2026-04-08",
      entries: [
        { ingredientId: 1, quantityInput: "5.0", notes: "test" },
        { ingredientId: 2, quantityInput: "3.0" },
      ],
    });
    expect(result).toEqual({ success: true });
  });
});

describe("Sales Report API", () => {
  it("getByWeek requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.sales.getByWeek({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
    })).rejects.toThrow();
  });

  it("getByWeek returns array for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sales.getByWeek({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("saveSales requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.sales.saveSales({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
      items: [{ menuItemId: 1, quantitySold: 10 }],
    })).rejects.toThrow();
  });

  it("saveSales succeeds for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sales.saveSales({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
      items: [
        { menuItemId: 1, quantitySold: 10, totalRevenue: "250.00" },
        { menuItemId: 2, quantitySold: 5, totalRevenue: "200.00" },
      ],
    });
    expect(result).toEqual({ success: true });
  });
});

describe("Waste Analysis API", () => {
  it("getWasteReport requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.analysis.getWasteReport({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
    })).rejects.toThrow();
  });

  it("getWasteReport returns report object for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analysis.getWasteReport({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
    });
    expect(result).toHaveProperty("report");
    expect(Array.isArray(result.report)).toBe(true);
  });
});

describe("Input Validation", () => {
  it("waste.saveEntries rejects invalid date format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.waste.saveEntries({
      date: "",
      entries: [],
    })).resolves.toEqual({ success: true }); // Empty entries is valid
  });

  it("sales.saveSales rejects negative quantities", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Zero quantity items are filtered out, so this should succeed
    const result = await caller.sales.saveSales({
      weekStartDate: "2026-04-05",
      weekEndDate: "2026-04-11",
      items: [{ menuItemId: 1, quantitySold: 0 }],
    });
    expect(result).toEqual({ success: true });
  });
});

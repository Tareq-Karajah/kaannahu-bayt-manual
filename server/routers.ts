import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { menuCategories, menuItems, ingredients, dailyWasteEntries, weeklySalesReports } from "../drizzle/schema";
import { eq, and, between, sql, desc, asc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Menu routes
  menu: router({
    getCategories: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder));
    }),

    getItems: publicProcedure.input(z.object({
      categoryId: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input?.categoryId) {
        return db.select().from(menuItems)
          .where(eq(menuItems.categoryId, input.categoryId))
          .orderBy(asc(menuItems.sortOrder));
      }
      return db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
    }),

    getItemsWithCategory: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select({
        id: menuItems.id,
        nameAr: menuItems.nameAr,
        price: menuItems.price,
        mainIngredient: menuItems.mainIngredient,
        ingredientWeightGrams: menuItems.ingredientWeightGrams,
        categoryNameAr: menuCategories.nameAr,
        categoryId: menuCategories.id,
      })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder));
      return result;
    }),
  }),

  // Ingredients routes
  ingredients: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(ingredients);
    }),
  }),

  // Daily waste entry routes
  waste: router({
    // Get entries for a specific date
    getByDate: protectedProcedure.input(z.object({
      date: z.string(), // YYYY-MM-DD
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: dailyWasteEntries.id,
        entryDate: dailyWasteEntries.entryDate,
        ingredientId: dailyWasteEntries.ingredientId,
        quantityInput: dailyWasteEntries.quantityInput,
        notes: dailyWasteEntries.notes,
        ingredientNameAr: ingredients.nameAr,
        ingredientNameEn: ingredients.nameEn,
        unit: ingredients.unit,
      })
        .from(dailyWasteEntries)
        .innerJoin(ingredients, eq(dailyWasteEntries.ingredientId, ingredients.id))
        .where(eq(dailyWasteEntries.entryDate, input.date));
    }),

    // Get entries for a date range
    getByRange: protectedProcedure.input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: dailyWasteEntries.id,
        entryDate: dailyWasteEntries.entryDate,
        ingredientId: dailyWasteEntries.ingredientId,
        quantityInput: dailyWasteEntries.quantityInput,
        notes: dailyWasteEntries.notes,
        ingredientNameAr: ingredients.nameAr,
        ingredientNameEn: ingredients.nameEn,
        unit: ingredients.unit,
      })
        .from(dailyWasteEntries)
        .innerJoin(ingredients, eq(dailyWasteEntries.ingredientId, ingredients.id))
        .where(between(dailyWasteEntries.entryDate, input.startDate, input.endDate))
        .orderBy(desc(dailyWasteEntries.entryDate));
    }),

    // Save daily entries (upsert)
    saveEntries: protectedProcedure.input(z.object({
      date: z.string(),
      entries: z.array(z.object({
        ingredientId: z.number(),
        quantityInput: z.string(),
        notes: z.string().optional(),
      })),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Delete existing entries for this date
      await db.delete(dailyWasteEntries).where(eq(dailyWasteEntries.entryDate, input.date));

      // Insert new entries
      for (const entry of input.entries) {
        if (parseFloat(entry.quantityInput) > 0) {
          await db.insert(dailyWasteEntries).values({
            entryDate: input.date,
            ingredientId: entry.ingredientId,
            quantityInput: entry.quantityInput,
            notes: entry.notes || null,
            createdByUserId: ctx.user?.id || null,
          });
        }
      }

      return { success: true };
    }),
  }),

  // Weekly sales report routes
  sales: router({
    // Get sales for a specific week
    getByWeek: protectedProcedure.input(z.object({
      weekStartDate: z.string(),
      weekEndDate: z.string(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: weeklySalesReports.id,
        weekStartDate: weeklySalesReports.weekStartDate,
        weekEndDate: weeklySalesReports.weekEndDate,
        menuItemId: weeklySalesReports.menuItemId,
        quantitySold: weeklySalesReports.quantitySold,
        totalRevenue: weeklySalesReports.totalRevenue,
        notes: weeklySalesReports.notes,
        menuItemNameAr: menuItems.nameAr,
        menuItemPrice: menuItems.price,
        mainIngredient: menuItems.mainIngredient,
        ingredientWeightGrams: menuItems.ingredientWeightGrams,
      })
        .from(weeklySalesReports)
        .innerJoin(menuItems, eq(weeklySalesReports.menuItemId, menuItems.id))
        .where(
          and(
            eq(weeklySalesReports.weekStartDate, input.weekStartDate),
            eq(weeklySalesReports.weekEndDate, input.weekEndDate)
          )
        );
    }),

    // Save weekly sales
    saveSales: protectedProcedure.input(z.object({
      weekStartDate: z.string(),
      weekEndDate: z.string(),
      items: z.array(z.object({
        menuItemId: z.number(),
        quantitySold: z.number(),
        totalRevenue: z.string().optional(),
      })),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Delete existing entries for this week
      await db.delete(weeklySalesReports).where(
        and(
          eq(weeklySalesReports.weekStartDate, input.weekStartDate),
          eq(weeklySalesReports.weekEndDate, input.weekEndDate)
        )
      );

      // Insert new entries
      for (const item of input.items) {
        if (item.quantitySold > 0) {
          await db.insert(weeklySalesReports).values({
            weekStartDate: input.weekStartDate,
            weekEndDate: input.weekEndDate,
            menuItemId: item.menuItemId,
            quantitySold: item.quantitySold,
            totalRevenue: item.totalRevenue || "0",
            createdByUserId: ctx.user?.id || null,
          });
        }
      }

      return { success: true };
    }),
  }),

  // Waste analysis/comparison
  analysis: router({
    // Compare input quantities vs sales for a date range
    getWasteReport: protectedProcedure.input(z.object({
      weekStartDate: z.string(),
      weekEndDate: z.string(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { ingredients: [], totalWaste: {} };

      // Get total input quantities for the week (from daily entries)
      const inputData = await db.select({
        ingredientId: dailyWasteEntries.ingredientId,
        ingredientNameAr: ingredients.nameAr,
        ingredientNameEn: ingredients.nameEn,
        unit: ingredients.unit,
        totalInput: sql<string>`SUM(${dailyWasteEntries.quantityInput})`,
      })
        .from(dailyWasteEntries)
        .innerJoin(ingredients, eq(dailyWasteEntries.ingredientId, ingredients.id))
        .where(between(dailyWasteEntries.entryDate, input.weekStartDate, input.weekEndDate))
        .groupBy(dailyWasteEntries.ingredientId, ingredients.nameAr, ingredients.nameEn, ingredients.unit);

      // Get sales data for the week - calculate consumed ingredients from sold items
      const salesData = await db.select({
        mainIngredient: menuItems.mainIngredient,
        totalConsumedGrams: sql<string>`SUM(${weeklySalesReports.quantitySold} * ${menuItems.ingredientWeightGrams})`,
        totalRevenue: sql<string>`SUM(${weeklySalesReports.totalRevenue})`,
        totalItemsSold: sql<string>`SUM(${weeklySalesReports.quantitySold})`,
      })
        .from(weeklySalesReports)
        .innerJoin(menuItems, eq(weeklySalesReports.menuItemId, menuItems.id))
        .where(
          and(
            eq(weeklySalesReports.weekStartDate, input.weekStartDate),
            eq(weeklySalesReports.weekEndDate, input.weekEndDate)
          )
        )
        .groupBy(menuItems.mainIngredient);

      // Map ingredient types to names
      const ingredientTypeMap: Record<string, string> = {
        'meat': 'اللحمة',
        'chicken': 'الجاج',
        'vegetables': 'الخضرة',
        'bread': 'الخبز',
      };

      // Build comparison report
      const report = inputData.map(inp => {
        const ingredientType = Object.entries(ingredientTypeMap).find(
          ([_, name]) => name === inp.ingredientNameAr
        )?.[0];

        const sales = salesData.find(s => s.mainIngredient === ingredientType);
        const totalInputKg = parseFloat(inp.totalInput || "0");
        const totalConsumedKg = sales ? parseFloat(sales.totalConsumedGrams || "0") / 1000 : 0;
        const wasteKg = totalInputKg - totalConsumedKg;
        const wastePercentage = totalInputKg > 0 ? (wasteKg / totalInputKg) * 100 : 0;

        return {
          ingredientId: inp.ingredientId,
          ingredientNameAr: inp.ingredientNameAr,
          ingredientNameEn: inp.ingredientNameEn,
          unit: inp.unit,
          totalInputKg,
          totalConsumedKg,
          wasteKg,
          wastePercentage: Math.round(wastePercentage * 100) / 100,
          totalItemsSold: sales ? parseInt(sales.totalItemsSold || "0") : 0,
          totalRevenue: sales ? parseFloat(sales.totalRevenue || "0") : 0,
        };
      });

      return { report };
    }),
  }),
});

export type AppRouter = typeof appRouter;

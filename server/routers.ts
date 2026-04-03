import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveCashClosing, getCashClosingsByDate, getCashClosingHistory, deleteCashClosing, updateDailyStatistics, getDailyStatistics, saveProduct, getProducts, updateProduct, deleteProduct, saveWasteLog, getWasteLogs, saveWasteAlert, getWasteAlerts } from "./db";
import { InsertCashClosing } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Cash Closing Router
  cashClosing: router({
    save: publicProcedure
      .input(z.object({
        employeeName: z.string(),
        closingDate: z.string(),
        cashIn: z.string(),
        cash: z.string(),
        visa: z.string(),
        total1: z.string(),
        expenses: z.string(),
        systemReport: z.string(),
        cashCountTotal: z.string(),
        visaMachineReport: z.string(),
        visaWellsReport: z.string(),
        visaFoodOnTimeReport: z.string(),
        total2: z.string(),
        cashReport: z.string(),
        difference: z.string(),
        shekelNotes200: z.number().optional(),
        shekelNotes100: z.number().optional(),
        shekelNotes50: z.number().optional(),
        shekelNotes20: z.number().optional(),
        shekelNotes10: z.number().optional(),
        shekelNotes5: z.number().optional(),
        shekelCoins2: z.number().optional(),
        shekelCoins1: z.number().optional(),
        shekelCoins05: z.number().optional(),
        dollarAmount: z.string().optional(),
        dinarAmount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: InsertCashClosing = {
          userId: 1, // Default user ID since no auth
          employeeName: input.employeeName,
          closingDate: input.closingDate as any,
          cashIn: input.cashIn as any,
          cash: input.cash as any,
          visa: input.visa as any,
          total1: input.total1 as any,
          expenses: input.expenses as any,
          systemReport: input.systemReport as any,
          cashCountTotal: input.cashCountTotal as any,
          visaMachineReport: input.visaMachineReport as any,
          visaWellsReport: input.visaWellsReport as any,
          visaFoodOnTimeReport: input.visaFoodOnTimeReport as any,
          total2: input.total2 as any,
          cashReport: input.cashReport as any,
          difference: input.difference as any,
          shekelNotes200: input.shekelNotes200,
          shekelNotes100: input.shekelNotes100,
          shekelNotes50: input.shekelNotes50,
          shekelNotes20: input.shekelNotes20,
          shekelNotes10: input.shekelNotes10,
          shekelNotes5: input.shekelNotes5,
          shekelCoins2: input.shekelCoins2,
          shekelCoins1: input.shekelCoins1,
          shekelCoins05: input.shekelCoins05,
          dollarAmount: input.dollarAmount as any,
          dinarAmount: input.dinarAmount as any,
          status: input.difference === "0" ? "balanced" : "difference",
          notes: input.notes,
        };
        return saveCashClosing(data);
      }),
    
    getByDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        const date = new Date(input.date);
        return getCashClosingsByDate(date);
      }),
    
    getHistory: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getCashClosingHistory(1, input.limit || 30);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCashClosing(input.id);
        return { success: true };
      }),
  }),

  // Statistics Router
  statistics: router({
    updateDaily: publicProcedure
      .input(z.object({ date: z.string() }))
      .mutation(async ({ input }) => {
        const date = new Date(input.date);
        return updateDailyStatistics(date);
      }),
    
    getRange: publicProcedure
      .input(z.object({ startDate: z.string(), endDate: z.string() }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return getDailyStatistics(startDate, endDate);
      }),
  }),

  // Products Router
  products: router({
    save: publicProcedure
      .input(z.object({
        name: z.string(),
        category: z.string(),
        quantity: z.number(),
        unit: z.string(),
        expiryDate: z.string(),
        storageLocation: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return saveProduct({
          userId: ctx.user?.id || 1,
          ...input,
          expiryDate: input.expiryDate as any,
          status: 'healthy',
        });
      }),
    
    getAll: publicProcedure
      .query(async ({ ctx }) => {
        return getProducts(ctx.user?.id || 1);
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return updateProduct(input.id, input);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // Waste Router
  waste: router({
    logWaste: publicProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number(),
        unit: z.string(),
        reason: z.string(),
        estimatedCost: z.number().optional(),
        wasteDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return saveWasteLog({
          userId: ctx.user?.id || 1,
          ...input,
          wasteDate: input.wasteDate as any,
          estimatedCost: input.estimatedCost?.toString(),
        });
      }),
    
    getWasteLogs: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        return getWasteLogs(ctx.user?.id || 1, startDate, endDate);
      }),
    
    getAlerts: publicProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        return getWasteAlerts(ctx.user?.id || 1, input.status);
      }),
    
    createAlert: publicProcedure
      .input(z.object({
        productId: z.number(),
        wastePercentage: z.number(),
        threshold: z.number().optional(),
        alertDate: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return saveWasteAlert({
          userId: ctx.user?.id || 1,
          ...input,
          alertDate: input.alertDate as any,
          status: 'active',
          threshold: input.threshold?.toString() || '5',
          wastePercentage: input.wastePercentage.toString(),
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;

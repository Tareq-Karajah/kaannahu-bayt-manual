import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveCashClosing, getCashClosingsByDate, getCashClosingHistory, updateDailyStatistics, getDailyStatistics } from "./db";
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
});

export type AppRouter = typeof appRouter;

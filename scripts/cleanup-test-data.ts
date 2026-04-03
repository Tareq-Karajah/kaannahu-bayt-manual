#!/usr/bin/env tsx

/**
 * Script to clean up test data from the database
 * Run with: pnpm tsx scripts/cleanup-test-data.ts
 */

import { getDb, deleteCashClosing } from "../server/db";
import { cashClosings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function cleanupTestData() {
  try {
    const db = await getDb();
    
    if (!db) {
      console.error("❌ Database not available");
      process.exit(1);
    }

    // Get test records
    const testEmployees = ["Test Employee", "Another Employee"];
    
    for (const employeeName of testEmployees) {
      const records = await db
        .select()
        .from(cashClosings)
        .where(eq(cashClosings.employeeName, employeeName));
      
      console.log(`Found ${records.length} records for ${employeeName}`);
      
      for (const record of records) {
        await deleteCashClosing(record.id);
        console.log(`  ✓ Deleted record ID: ${record.id}`);
      }
    }

    console.log("\n✅ Test data cleanup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
    process.exit(1);
  }
}

cleanupTestData();

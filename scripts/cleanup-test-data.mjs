#!/usr/bin/env node

/**
 * Script to clean up test data from the database
 * Run with: node scripts/cleanup-test-data.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import { cashClosings } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function cleanupTestData() {
  try {
    const db = drizzle(DATABASE_URL);

    // Delete test records
    const testEmployees = ["Test Employee", "Another Employee"];
    
    for (const employeeName of testEmployees) {
      const deleted = await db
        .delete(cashClosings)
        .where(eq(cashClosings.employeeName, employeeName));
      
      console.log(`Deleted ${employeeName} records`);
    }

    console.log("✅ Test data cleanup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
    process.exit(1);
  }
}

cleanupTestData();

import { describe, expect, it } from "vitest";
import {
  SHEKEL_DENOMINATIONS,
  calculateCashFromDenominationCounts,
  getCashDenominationField,
  getCashDenominationPayload,
  readCashDenominationCounts,
} from "@/lib/cashDenominations";

describe("cash denomination field mapping", () => {
  it("maps 1₪ and 2₪ to coin columns, never note columns", () => {
    expect(getCashDenominationField(2)).toBe("shekelCoins2");
    expect(getCashDenominationField(1)).toBe("shekelCoins1");
    expect(getCashDenominationField(0.5)).toBe("shekelCoins05");
    expect(getCashDenominationField(5)).toBe("shekelNotes5");
  });

  it("reads and writes the database field names without losing 1₪ and 2₪ counts", () => {
    const databaseRecord = {
      shekelNotes200: 7,
      shekelNotes100: 0,
      shekelNotes50: 0,
      shekelNotes20: 0,
      shekelNotes10: 0,
      shekelNotes5: 3,
      shekelCoins2: 11,
      shekelCoins1: 13,
      shekelCoins05: 4,
    };

    const counts = readCashDenominationCounts(databaseRecord);
    expect(counts[2]).toBe(11);
    expect(counts[1]).toBe(13);
    expect(counts[0.5]).toBe(4);

    expect(getCashDenominationPayload(counts)).toMatchObject({
      shekelCoins2: 11,
      shekelCoins1: 13,
      shekelCoins05: 4,
      shekelNotes5: 3,
    });

    expect(calculateCashFromDenominationCounts(counts)).toBe(1452);
  });

  it("keeps every displayed denomination represented exactly once", () => {
    const fields = SHEKEL_DENOMINATIONS.map(getCashDenominationField);
    expect(new Set(fields).size).toBe(SHEKEL_DENOMINATIONS.length);
  });
});

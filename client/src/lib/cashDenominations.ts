export const SHEKEL_DENOMINATIONS = [200, 100, 50, 20, 10, 5, 2, 1, 0.5] as const;

export type ShekelDenomination = (typeof SHEKEL_DENOMINATIONS)[number];

export type CashDenominationField =
  | "shekelNotes200"
  | "shekelNotes100"
  | "shekelNotes50"
  | "shekelNotes20"
  | "shekelNotes10"
  | "shekelNotes5"
  | "shekelCoins2"
  | "shekelCoins1"
  | "shekelCoins05";

/**
 * Maps the displayed denomination to the exact database property name.
 * The 1₪ and 2₪ values are coins, not notes, so they must never be built as
 * `shekelNotes${denomination}`.
 */
export function getCashDenominationField(
  denomination: ShekelDenomination,
): CashDenominationField {
  switch (denomination) {
    case 200:
      return "shekelNotes200";
    case 100:
      return "shekelNotes100";
    case 50:
      return "shekelNotes50";
    case 20:
      return "shekelNotes20";
    case 10:
      return "shekelNotes10";
    case 5:
      return "shekelNotes5";
    case 2:
      return "shekelCoins2";
    case 1:
      return "shekelCoins1";
    case 0.5:
      return "shekelCoins05";
  }
}

export type CashDenominationCounts = Record<ShekelDenomination, number>;

export function readCashDenominationCounts(
  record: Partial<Record<CashDenominationField, unknown>>,
): CashDenominationCounts {
  return Object.fromEntries(
    SHEKEL_DENOMINATIONS.map((denomination) => {
      const field = getCashDenominationField(denomination);
      const value = Number(record[field]);
      return [denomination, Number.isFinite(value) ? value : 0];
    }),
  ) as CashDenominationCounts;
}

export function getCashDenominationPayload(
  counts: Partial<CashDenominationCounts>,
): Record<CashDenominationField, number> {
  return Object.fromEntries(
    SHEKEL_DENOMINATIONS.map((denomination) => [
      getCashDenominationField(denomination),
      Number(counts[denomination]) || 0,
    ]),
  ) as Record<CashDenominationField, number>;
}

export function calculateCashFromDenominationCounts(
  counts: Partial<CashDenominationCounts>,
): number {
  return SHEKEL_DENOMINATIONS.reduce(
    (total, denomination) => total + denomination * (Number(counts[denomination]) || 0),
    0,
  );
}

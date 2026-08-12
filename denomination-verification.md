# Saved Cash Closing Denomination Verification

On 2026-08-12, the current preview route `/cash-closing-details?id=3090001` was opened after the shared denomination mapping changes. The saved report displayed `2 ₪: 22 × 2 = 44.00` and `1 ₪: 58 × 1 = 58.00`, confirming that the details page now reads `shekelCoins2` and `shekelCoins1` instead of looking for nonexistent `shekelNotes2` and `shekelNotes1` fields.

The same page also showed the other denominations correctly, including `5 ₪: 22 × 5 = 110.00`, and the preview had no visible client-side error. The production build passed. Targeted mapping tests passed, while the full suite still contains unrelated pre-existing failures in `server/menu-waste.test.ts` and a capped-history assertion in `server/cashClosing.persistence.test.ts`.

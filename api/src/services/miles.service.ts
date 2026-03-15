import { Decimal } from '@prisma/client/runtime/library';

export type RateRule = {
  mpd: Decimal | number;
  minSpend: Decimal | number | null;
  monthlyCap: Decimal | number | null;
};

export type MilesResult = {
  milesEarned: number;
  effectiveRate: number; // blended mpd for display
  cappedWarning: boolean; // some spend hit a cap
  capsExhausted: boolean; // best rate cap fully used up before this transaction
  minSpendUnmet: boolean; // a higher-rate rule exists but minSpend not met
};

function toNum(v: Decimal | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  return typeof v === 'number' ? v : Number(v);
}

/**
 * Compute miles earned for a single transaction.
 *
 * @param rules         CardRateRules for this card+category, any order (will sort by mpd desc)
 * @param baseRateMpd   Card's base rate for uncategorised / remaining spend
 * @param amount        Transaction amount in SGD
 * @param alreadySpent  User's cumulative spend on this card+category this calendar month
 *                      (excluding the current transaction)
 */
export function computeMiles(
  rules: RateRule[],
  baseRateMpd: Decimal | number,
  amount: number,
  alreadySpent: number = 0
): MilesResult {
  const base = toNum(baseRateMpd) ?? 1.2;
  const sortedRules = [...rules].sort(
    (a, b) => (toNum(b.mpd) ?? 0) - (toNum(a.mpd) ?? 0)
  );

  let remainingAmount = amount;
  let totalMiles = 0;
  let cappedWarning = false;
  let capsExhausted = false;
  let minSpendUnmet = false;

  for (const rule of sortedRules) {
    const mpd = toNum(rule.mpd) ?? 0;
    const minSpend = toNum(rule.minSpend);
    const monthlyCap = toNum(rule.monthlyCap);

    // Check minimum spend threshold
    if (minSpend !== null && alreadySpent < minSpend) {
      minSpendUnmet = true;
      continue;
    }

    // Check monthly cap
    if (monthlyCap !== null) {
      const capRemaining = monthlyCap - alreadySpent;
      if (capRemaining <= 0) {
        capsExhausted = true;
        continue;
      }
      const eligibleAmount = Math.min(remainingAmount, capRemaining);
      totalMiles += eligibleAmount * mpd;
      remainingAmount -= eligibleAmount;
      if (eligibleAmount < remainingAmount + eligibleAmount) {
        // some spend overflowed the cap
        cappedWarning = true;
      }
    } else {
      // No cap — all remaining spend earns at this rate
      totalMiles += remainingAmount * mpd;
      remainingAmount = 0;
    }

    if (remainingAmount <= 0) break;
  }

  // Remaining spend earns base rate
  if (remainingAmount > 0) {
    totalMiles += remainingAmount * base;
    if (sortedRules.length > 0) {
      cappedWarning = true; // some spend fell back to base rate
    }
  }

  const effectiveRate = amount > 0 ? totalMiles / amount : base;

  return {
    milesEarned: Math.round(totalMiles * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    cappedWarning,
    capsExhausted,
    minSpendUnmet,
  };
}

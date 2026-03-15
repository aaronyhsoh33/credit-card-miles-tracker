import { computeMiles } from '../../src/services/miles.service';

describe('computeMiles', () => {
  const baseRate = 1.2;

  it('returns base rate when no category rules exist', () => {
    const result = computeMiles([], baseRate, 100, 0);
    expect(result.milesEarned).toBe(120);
    expect(result.effectiveRate).toBe(1.2);
    expect(result.cappedWarning).toBe(false);
  });

  it('applies a simple uncapped rate', () => {
    const rules = [{ mpd: 4.0, minSpend: null, monthlyCap: null }];
    const result = computeMiles(rules, baseRate, 100, 0);
    expect(result.milesEarned).toBe(400);
    expect(result.effectiveRate).toBe(4.0);
    expect(result.cappedWarning).toBe(false);
  });

  it('applies rate up to cap then falls back to base rate', () => {
    const rules = [{ mpd: 4.0, minSpend: null, monthlyCap: 1000 }];
    // Already spent $900, cap is $1000, so $100 eligible at 4mpd
    const result = computeMiles(rules, baseRate, 150, 900);
    // $100 at 4mpd = 400 miles, $50 at 1.2mpd = 60 miles
    expect(result.milesEarned).toBe(460);
    expect(result.cappedWarning).toBe(true);
  });

  it('returns base rate when cap is already exhausted', () => {
    const rules = [{ mpd: 4.0, minSpend: null, monthlyCap: 1000 }];
    const result = computeMiles(rules, baseRate, 100, 1000);
    expect(result.milesEarned).toBe(120);
    expect(result.capsExhausted).toBe(true);
  });

  it('skips rule when minSpend not met', () => {
    const rules = [{ mpd: 4.0, minSpend: 500, monthlyCap: null }];
    const result = computeMiles(rules, baseRate, 100, 200);
    expect(result.milesEarned).toBe(120); // falls back to base
    expect(result.minSpendUnmet).toBe(true);
  });

  it('applies rule when minSpend is met', () => {
    const rules = [{ mpd: 4.0, minSpend: 500, monthlyCap: null }];
    const result = computeMiles(rules, baseRate, 100, 600);
    expect(result.milesEarned).toBe(400);
    expect(result.minSpendUnmet).toBe(false);
  });

  it('handles tiered rules — higher mpd first', () => {
    // First $500 at 4mpd, remainder at 2mpd
    const rules = [
      { mpd: 4.0, minSpend: null, monthlyCap: 500 },
      { mpd: 2.0, minSpend: null, monthlyCap: 1000 },
    ];
    const result = computeMiles(rules, baseRate, 300, 300);
    // Already spent $300. Cap1 remaining: $200, Cap2 remaining: $700
    // $200 at 4mpd = 800 miles, $100 at 2mpd = 200 miles
    expect(result.milesEarned).toBe(1000);
  });

  it('handles zero amount gracefully', () => {
    const rules = [{ mpd: 4.0, minSpend: null, monthlyCap: 1000 }];
    const result = computeMiles(rules, baseRate, 0, 0);
    expect(result.milesEarned).toBe(0);
  });
});

export type CardRuleSeed = {
  categorySlug: string;
  mpd: number;
  minSpend?: number;
  monthlyCap?: number;
  notes?: string;
};

export type CardSeedData = {
  slug: string;
  name: string;
  bank: string;
  network: string;
  annualFee: number; // SGD cents
  baseRateMpd: number;
  imagePath: string;
  rules: CardRuleSeed[];
};

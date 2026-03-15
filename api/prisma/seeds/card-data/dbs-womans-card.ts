import { CardSeedData } from './types';

export const dbsWomansCard: CardSeedData = {
  slug: 'dbs-womans-card',
  name: "DBS Woman's Card",
  bank: 'DBS',
  network: 'Visa',
  annualFee: 19275,
  baseRateMpd: 1.2,
  imagePath: 'assets/cards/dbs-womans-card.png',
  rules: [
    {
      categorySlug: 'online',
      mpd: 4.0,
      monthlyCap: 1500,
      notes: '4 mpd on online spend, capped at $1,500/month',
    },
    {
      categorySlug: 'shopping',
      mpd: 4.0,
      monthlyCap: 1500,
      notes: '4 mpd on shopping, shared $1,500 cap with online category',
    },
  ],
};

import { CardSeedData } from './types';

export const uobLadysCard: CardSeedData = {
  slug: 'uob-ladys-card',
  name: "UOB Lady's Card",
  bank: 'UOB',
  network: 'Visa',
  annualFee: 19275,
  baseRateMpd: 1.2,
  imagePath: 'assets/cards/uob-ladys-card.png',
  rules: [
    {
      categorySlug: 'dining',
      mpd: 4.0,
      monthlyCap: 1000,
      notes: '4 mpd on dining. Category rotates quarterly — dining is one option.',
    },
    {
      categorySlug: 'entertainment',
      mpd: 4.0,
      monthlyCap: 1000,
      notes: '4 mpd on entertainment. Category rotates quarterly.',
    },
    {
      categorySlug: 'transport',
      mpd: 4.0,
      monthlyCap: 1000,
      notes: '4 mpd on transport. Category rotates quarterly.',
    },
  ],
};

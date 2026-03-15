import { CardSeedData } from './types';

export const citiRewards: CardSeedData = {
  slug: 'citi-rewards',
  name: 'Citi Rewards Card',
  bank: 'Citi',
  network: 'Visa',
  annualFee: 19275,
  baseRateMpd: 1.2,
  imagePath: 'assets/cards/citi-rewards.png',
  rules: [
    {
      categorySlug: 'online',
      mpd: 4.0,
      monthlyCap: 1000,
      notes: '4 mpd on online shopping (excluding travel). $1,000/month cap.',
    },
    {
      categorySlug: 'shopping',
      mpd: 4.0,
      monthlyCap: 1000,
      notes: '4 mpd on shopping. Shared $1,000 cap.',
    },
  ],
};

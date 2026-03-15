import { CardSeedData } from './types';

export const hsbcRevolution: CardSeedData = {
  slug: 'hsbc-revolution',
  name: 'HSBC Revolution Card',
  bank: 'HSBC',
  network: 'Mastercard',
  annualFee: 0,
  baseRateMpd: 0.4,
  imagePath: 'assets/cards/hsbc-revolution.png',
  rules: [
    {
      categorySlug: 'dining',
      mpd: 2.0,
      monthlyCap: 1000,
      notes: '2 mpd on dining. $1,000/month combined cap with entertainment and online.',
    },
    {
      categorySlug: 'entertainment',
      mpd: 2.0,
      monthlyCap: 1000,
      notes: '2 mpd on entertainment. $1,000/month combined cap.',
    },
    {
      categorySlug: 'online',
      mpd: 2.0,
      monthlyCap: 1000,
      notes: '2 mpd on online spend. $1,000/month combined cap.',
    },
  ],
};

import { CardSeedData } from './types';

export const dbsAltitude: CardSeedData = {
  slug: 'dbs-altitude',
  name: 'DBS Altitude Visa Signature Card',
  bank: 'DBS',
  network: 'Visa',
  annualFee: 19275,
  baseRateMpd: 1.2,
  imagePath: 'assets/cards/dbs-altitude.png',
  rules: [
    {
      categorySlug: 'travel',
      mpd: 3.0,
      notes: '3 mpd on online flight and hotel bookings. No monthly cap.',
    },
  ],
};

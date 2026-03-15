export type Category = {
  id: number;
  slug: string;
  label: string;
  icon: string;
};

export type CardRateRule = {
  id: number;
  cardId: number;
  categoryId: number;
  mpd: string; // Decimal as string from Prisma
  minSpend: string | null;
  monthlyCap: string | null;
  notes: string | null;
  category: Category;
};

export type Card = {
  id: number;
  slug: string;
  name: string;
  bank: string;
  network: string;
  annualFee: number;
  baseRateMpd: string;
  imagePath: string;
  isActive: boolean;
  rateRules: CardRateRule[];
};

export type UserCard = {
  id: number;
  userId: number;
  cardId: number;
  nickname: string | null;
  addedAt: string;
  card: Card;
};

export type Transaction = {
  id: number;
  userId: number;
  cardId: number;
  categoryId: number;
  amount: string;
  merchant: string | null;
  notes: string | null;
  transactedAt: string;
  milesEarned: string;
  createdAt: string;
  card: Card;
  category: Category;
};

export type RecommendResult = {
  cardId: number;
  cardName: string;
  bank: string;
  network: string;
  nickname: string | null;
  bestMpd: number;
  milesEarned: number | null;
  effectiveRate: number;
  cappedWarning: boolean;
  capsExhausted: boolean;
  minSpendUnmet: boolean;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type TransactionSummary = {
  totalSpend: number;
  totalMiles: number;
  totalTransactions: number;
  byCard: { cardId: number; _sum: { amount: string; milesEarned: string }; _count: number }[];
  byCategory: { categoryId: number; _sum: { amount: string; milesEarned: string }; _count: number }[];
};

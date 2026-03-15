# Credit Card Miles Tracker

A mobile app that helps Singapore consumers maximise credit card miles by recommending the best card for each spending category and tracking earned miles over time.

**The problem:** You own multiple cards — DBS Woman's Card earns 4 mpd online, UOB Lady's earns 4 mpd dining, Citi Rewards earns 4 mpd on shopping — but it's hard to remember which to use at the point of purchase, and even harder to track how much you've actually earned.

**The solution:** Pick a category, see your best card instantly. Log your spend, track your miles.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| App state | Zustand (auth) + React Query (server data) |
| Validation | Zod (shared between app and API) |

---

## Project Structure

```
credit-card-miles-tracker/
  package.json          # npm workspaces root
  api/                  # Express backend
  app/                  # Expo React Native app
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)

### 1. Clone and install

```bash
git clone <repo-url>
cd credit-card-miles-tracker
npm install
```

### 2. Configure the backend

```bash
cp api/.env.example api/.env
```

Edit `api/.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/miles_tracker"
JWT_SECRET="a-long-random-secret-at-least-32-chars"
```

### 3. Run database migrations and seed data

```bash
cd api
npx prisma migrate dev --name init
npm run db:seed
```

This creates all tables and seeds 5 Singapore credit cards with accurate reward rates.

### 4. Start the backend

```bash
npm run api
# Server runs on http://localhost:3000
```

### 5. Start the mobile app

```bash
npm run app
# Opens Expo DevTools — scan QR with Expo Go app
```

Set `EXPO_PUBLIC_API_URL` in `app/.env` if your API is not at `localhost:3000`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
```

---

## Features

### Best Card Recommender
Select a spending category (dining, online, groceries, travel, etc.) and optionally enter an amount. The app ranks your saved cards by projected miles earned, accounting for monthly caps and minimum spend thresholds. Includes a shortcut to log the spend with the recommended card.

### Spending Tracker
Log transactions with merchant, category, card, and amount. Miles are computed automatically at save time using the card's rate rules. Historical accuracy is preserved — if card rates change later, past records are unaffected.

### Card Catalog
Browse all supported Singapore credit cards, filterable by bank. Add any card to your personal wallet to include it in recommendations.

### Home Dashboard
Monthly miles total, per-category best card overview, and recent transaction history.

---

## Pre-loaded Singapore Credit Cards

| Card | Best Category | Rate | Monthly Cap |
|---|---|---|---|
| DBS Woman's Card | Online / Shopping | 4 mpd | S$1,500 |
| UOB Lady's Card | Dining / Entertainment / Transport | 4 mpd | S$1,000 |
| Citi Rewards Card | Online / Shopping | 4 mpd | S$1,000 |
| HSBC Revolution Card | Dining / Online / Entertainment | 2 mpd | S$1,000 combined |
| DBS Altitude Visa Signature | Travel | 3 mpd | Uncapped |

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/auth/refresh` | — | Refresh access token |
| GET | `/cards` | — | List all cards (`?bank=DBS`) |
| GET | `/cards/:id` | — | Card detail with rate rules |
| GET | `/categories` | — | List spending categories |
| GET | `/me` | ✓ | Current user profile |
| GET | `/me/cards` | ✓ | User's saved cards |
| POST | `/me/cards` | ✓ | Add card to wallet |
| DELETE | `/me/cards/:cardId` | ✓ | Remove card from wallet |
| GET | `/recommend?category=dining&amount=100` | ✓ | Ranked card recommendations |
| GET | `/recommend/all` | ✓ | Best card per category |
| GET | `/transactions` | ✓ | Paginated transaction list |
| POST | `/transactions` | ✓ | Log transaction (auto-computes miles) |
| GET | `/transactions/summary` | ✓ | Totals by card and category |

---

## Development

### Run API tests

```bash
cd api
npm test
```

### Explore the database

```bash
cd api
npx prisma studio
```

### Add a new credit card

Create a file in `api/prisma/seeds/card-data/` following the existing pattern, then add it to `api/prisma/seeds/card-data/index.ts` and re-run `npm run db:seed`.

---

## How Miles Are Calculated

Each card has a base rate (e.g. 1.2 mpd) and category-specific rate rules with optional monthly caps and minimum spend thresholds. For a given transaction:

1. Rules for the card + category are sorted by mpd descending
2. Spend is allocated to the highest applicable rate first (checking caps and minimums)
3. Any remaining spend after caps are exhausted earns the base rate
4. The result is stored permanently on the transaction record

This means if you've already spent S$900 online this month on your DBS Woman's Card (S$1,500 cap at 4 mpd), a S$200 transaction will earn S$100 × 4 mpd = 400 miles + S$100 × 1.2 mpd = 120 miles = **520 miles total**, and the app will flag the partial cap.

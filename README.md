# Poll-Vote-App

A Next.js 14 App Router demo app to create polls, vote, and view live results.

## Features

- Create polls from the home page with:
  - question
  - poll type (single choice, multiple choice, rating 1-5)
  - optional expiry date/time
  - option emoji/image URL metadata
- Share poll links to collect votes
- Prevent duplicate votes via cookie after a successful vote
- Live-updating results page with:
  - horizontal Recharts bar chart + pie chart toggle
  - animated vote bars
  - vote percentages and total count
  - shareable poll URL and iframe embed snippet copy buttons
- Vote page countdown timer to poll expiry and type-specific voting controls
- Creator dashboard (`/dashboard`) stored in localStorage by creator session id
- Server-side in-memory poll storage (module-level `Map`)

## API

- `POST /api/polls` create a poll
- `GET /api/polls/[id]` get poll details and results
- `POST /api/polls/[id]/vote` submit a vote

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

# Poll-Vote-App

A Next.js 14 App Router demo app to create polls, vote, and view live results.

## Features

- Create polls from the home page with a question and 2-6 options
- Share poll links to collect votes
- Prevent duplicate votes via cookie after a successful vote
- Live-updating results page with a horizontal Recharts bar chart and vote percentages
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

# Cash Money Cup 🥒🎾💰

Welcome to the Cash Money Cup, a fun and interactive Pickleball tournament website where you can create tournaments, track matches, and bet on your favorite teams with a fake currency.

This project is a client-side rendered application built with Next.js and React, using Supabase for the backend database and authentication.

## Features

### Tournament Management
- **Create Tournaments:** Users can create their own Pickleball tournaments.
- **Tournament Brackets:** View dynamic tournament brackets for all ongoing tournaments.
- **Score Tracking:** Tournament creators can update match scores.
- **Match Locking:** Once a match begins, betting is locked to prevent cheating.
- **Flexible Structures:** Creators can randomize or change tournament structures (e.g., single elimination, double elimination).

### Betting System
- **Fake Currency:** Each user gets a balance of "PickleCash" to bet with.
- **Match & Tournament Betting:** Bet on individual match winners or the overall tournament champion.
- **Betting Spreads & Stats:** View betting odds and win probabilities for each team.

### User Features
- **Traditional Authentication:** Sign up and log in with an email and password.
- **User Profiles:** View your betting history and PickleCash balance.
- **Tournament Pages:** Each tournament has a dedicated page with all its details.
- **Player & Match Pages:** View details for each player, team, and match.

### Gameplay
- **Doubles Tournaments:** All tournaments are for doubles teams (two players per team).
- **Pickleball Rules:** Games are played to 11 points.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (Client-Side Rendered)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.io/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cash-money-cup
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com) and create a new project.
   - In your project dashboard, navigate to the **SQL Editor**.
   - Open the `database_setup.sql` file from this repository, copy the entire contents, and run it in the SQL Editor.

4. **Set up environment variables:**
   - Create a `.env.local` file in the root of the project.
   - Add the following environment variables from your Supabase project (find them in `Project Settings > API`):
     ```
     NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
     ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Database Schema

The database schema is defined in the `database_setup.sql` file. It includes tables for `profiles`, `tournaments`, `teams`, `matches`, and `bets`.

## Extra Features to Consider

- **Real-time Updates:** Use Supabase Realtime to show live score updates and betting odds.
- **Notifications:** Notify users when a match they bet on is about to start.
- **Leaderboards:** Show a leaderboard of the users with the most PickleCash.
- **User Avatars:** Allow users to upload a profile picture.
- **Private Tournaments:** Allow users to create private, invite-only tournaments.

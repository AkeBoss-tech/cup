# Cash Money Cup 🥒🎾💰

Welcome to the Cash Money Cup, a fun and interactive Pickleball tournament website where you can create tournaments, track matches, and bet on your favorite teams with a fake currency.

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
- **Simple Authentication:** Sign up and log in with just a username and password.
- **User Profiles:** View your betting history and PickleCash balance.
- **Tournament Pages:** Each tournament has a dedicated page with all its details.
- **Player & Match Pages:** View details for each player, team, and match.

### Gameplay
- **Doubles Tournaments:** All tournaments are for doubles teams (two players per team).
- **Pickleball Rules:** Games are played to 11 points.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.io/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Docker](https://www.docker.com/products/docker-desktop/) (for local Supabase development)

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

3. **Set up Supabase (Local):**
   - Install the Supabase CLI:
     ```bash
     npm install -g supabase
     ```
   - Start the local Supabase services:
     ```bash
     supabase init # Only run once
     supabase start
     ```
   - Link your project (you'll need to create a project on [supabase.com](https://supabase.com)):
      ```bash
      supabase link --project-ref <your-project-ref>
      ```
   - Apply the initial database migrations:
     ```bash
     supabase db push
     ```

4. **Set up environment variables:**
   - Create a `.env.local` file in the root of the project.
   - Add the following environment variables from your Supabase project (find them in your Supabase project dashboard under `Project Settings > API`):
     ```
     NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
     ```
   - For local development, you can get these values by running `supabase status` after starting the local services.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Database Schema

Here is the initial database schema design.

### `users`
- `id` (uuid, primary key)
- `username` (text, unique)
- `password` (encrypted)
- `pickle_cash_balance` (integer, default: 1000)
- `created_at` (timestamp)

### `tournaments`
- `id` (uuid, primary key)
- `name` (text)
- `creator_id` (uuid, foreign key to `users.id`)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `status` (text, e.g., 'upcoming', 'ongoing', 'completed')
- `structure` (text, e.g., 'single_elimination', 'double_elimination')
- `created_at` (timestamp)

### `teams`
- `id` (uuid, primary key)
- `name` (text)
- `player1_id` (uuid, foreign key to `users.id`)
- `player2_id` (uuid, foreign key to `users.id`)
- `created_at` (timestamp)

### `tournament_participants`
- `id` (uuid, primary key)
- `tournament_id` (uuid, foreign key to `tournaments.id`)
- `team_id` (uuid, foreign key to `teams.id`)

### `matches`
- `id` (uuid, primary key)
- `tournament_id` (uuid, foreign key to `tournaments.id`)
- `round_number` (integer)
- `team1_id` (uuid, foreign key to `teams.id`)
- `team2_id` (uuid, foreign key to `teams.id`)
- `team1_score` (integer, default: 0)
- `team2_score` (integer, default: 0)
- `winner_id` (uuid, foreign key to `teams.id`, nullable)
- `status` (text, e.g., 'scheduled', 'ongoing', 'completed', 'locked')
- `start_time` (timestamp)
- `created_at` (timestamp)

### `bets`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to `users.id`)
- `match_id` (uuid, foreign key to `matches.id`, nullable)
- `tournament_id` (uuid, foreign key to `tournaments.id`, nullable)
- `team_id` (uuid, foreign key to `teams.id`)
- `amount` (integer)
- `type` (text, e.g., 'match_winner', 'tournament_winner')
- `status` (text, e.g., 'active', 'won', 'lost')
- `created_at` (timestamp)

## Extra Features to Consider

- **Real-time Updates:** Use Supabase Realtime to show live score updates and betting odds.
- **Notifications:** Notify users when a match they bet on is about to start.
- **Leaderboards:** Show a leaderboard of the users with the most PickleCash.
- **User Avatars:** Allow users to upload a profile picture.
- **Private Tournaments:** Allow users to create private, invite-only tournaments.

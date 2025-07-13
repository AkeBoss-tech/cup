# Cash Money Cup 🥒🎾💰

Welcome to the Cash Money Cup, a fun and interactive Pickleball tournament website where you can create tournaments, track matches, and view player statistics.

This project is a client-side rendered application built with Next.js and React, using Supabase for the backend database and authentication.

## Features

### Tournament Management
- **Create Tournaments:** Users can create their own Pickleball tournaments.
- **Pre-defined Teams**: Create teams of two players that can be selected for tournaments.
- **Tournament Brackets:** View dynamic tournament brackets for all ongoing tournaments.
- **Score Tracking:** Tournament creators can update match scores.

### Player Statistics
- **Player Search**: Find players using the search bar on the homepage.
- **Stats Pages**: Each player has a dedicated page showing their win-loss record, win percentage, and most common teammates.

### User Features
- **Traditional Authentication:** Sign up and log in with an email and password.
- **User Profiles:** View your betting history and PickleCash balance.
- **Tournament Pages:** Each tournament has a dedicated page with all its details.

### Gameplay
- **Doubles Tournaments:** All tournaments are for doubles teams (two players per team).
- **Pickleball Rules:** Games are played to 11 points (score tracking is now implemented).

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
   git clone https://github.com/your-username/cup.git
   cd cup
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com) and create a new project.
   - In your project dashboard, navigate to the **SQL Editor**.
   - Open the `database_setup.sql` file from this repository, copy the entire contents, and run it in the SQL Editor. This will set up the necessary tables and functions.

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

The database schema is defined in the `database_setup.sql` file. It includes tables for `profiles`, `players`, `teams`, `team_players`, `tournaments`, `matches`, and `bets`.

It also includes a PostgreSQL function `get_player_stats` to efficiently calculate player statistics.

## API Routes

This project uses Next.js API routes for server-side logic:
- `GET /api/players/search?q={query}`: Searches for players by name.
- `GET /api/players/{id}/stats`: Retrieves detailed statistics for a specific player.

## Extra Features to Consider

- **Real-time Updates:** Use Supabase Realtime to show live score updates.
- **Notifications:** Notify users when a match they're interested in is about to start.
- **Leaderboards:** Show a leaderboard of the top players based on win percentage.
- **User Avatars:** Allow users to upload a profile picture.
- **Private Tournaments:** Allow users to create private, invite-only tournaments.

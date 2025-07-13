-- This script contains all the SQL commands to set up the database schema
-- for the Cash Money Cup application.
--
-- To use this script:
-- 1. Go to your Supabase project dashboard.
-- 2. Navigate to the "SQL Editor".
-- 3. Click on "New query".
-- 4. Copy and paste the entire content of this file into the editor.
-- 5. Click "Run".

-- ----------------------------
-- 1. PROFILES TABLE
-- Stores public user data, linked to the private auth.users table.
-- ----------------------------
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  pickle_cash_balance INTEGER DEFAULT 1000,

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( TRUE );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- ----------------------------
-- 2. HANDLE NEW USER TRIGGER
-- This trigger automatically creates a profile for new users.
-- ----------------------------
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------
-- 3. PLAYERS TABLE
-- Stores data about the players.
-- ----------------------------
CREATE TABLE public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- 4. TEAMS TABLE
-- Stores data about teams, which consist of two players.
-- ----------------------------
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- 5. TEAM_PLAYERS TABLE
-- Junction table to link players to teams.
-- ----------------------------
CREATE TABLE public.team_players (
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, player_id)
);
  
-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_1_id UUID REFERENCES public.teams(id),
  team_2_id UUID REFERENCES public.teams(id),
  team_1_score INT,
  team_2_score INT,
  match_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- We can add more fields like round number for tournaments
  round_number INT
);

-- Create match_participants table
CREATE TABLE public.match_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  is_winner BOOLEAN,
  UNIQUE(match_id, player_id) -- A player can only be in a match once
);

-- Create bets table
CREATE TABLE public.bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  match_id UUID REFERENCES public.matches(id) NOT NULL,
  winning_team_id INT NOT NULL, -- 1 or 2, refers to team_id in match_participants
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, match_id) -- A user can only bet once per match
);

-- Dummy data for players
INSERT INTO public.players (first_name, last_name) VALUES
('Ani', 'T'),
('Vyas', 'D'),
('Arnav', 'K'),
('Krish', 'B');

-- Dummy data for teams
WITH team1 AS (
  INSERT INTO public.teams (name) VALUES ('Arnav & Krish') RETURNING id
),
team2 AS (
  INSERT INTO public.teams (name) VALUES ('Ani & Vyas') RETURNING id
)
INSERT INTO public.team_players (team_id, player_id)
SELECT team1.id, p.id FROM team1, public.players p WHERE p.first_name IN ('Arnav', 'Krish')
UNION ALL
SELECT team2.id, p.id FROM team2, public.players p WHERE p.first_name IN ('Ani', 'Vyas');

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all for authenticated users" ON public.players FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" on public.teams FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" on public.team_players FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.tournaments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.matches FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.match_participants FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.bets FOR ALL TO authenticated USING (true);

-- ----------------------------
-- 6. GET_PLAYER_STATS FUNCTION
-- Calculates a player's stats, including win/loss record and common teammates.
-- ----------------------------
CREATE OR REPLACE FUNCTION get_player_stats(player_id_param UUID)
RETURNS json AS $$
DECLARE
    stats json;
BEGIN
    WITH player_matches AS (
        SELECT
            m.id,
            (CASE WHEN t.id = m.team_1_id THEN m.team_1_score > m.team_2_score
                  ELSE m.team_2_score > m.team_1_score
             END) as is_win
        FROM matches m
        JOIN team_players tp ON tp.team_id = m.team_1_id OR tp.team_id = m.team_2_id
        JOIN teams t on t.id = tp.team_id
        WHERE tp.player_id = player_id_param AND m.team_1_score IS NOT NULL AND m.team_2_score IS NOT NULL
    ),
    common_teammates AS (
        SELECT
            p.id,
            p.first_name,
            p.last_name,
            COUNT(*) as games_played_together
        FROM team_players tp1
        JOIN team_players tp2 ON tp1.team_id = tp2.team_id AND tp1.player_id != tp2.player_id
        JOIN players p ON p.id = tp2.player_id
        WHERE tp1.player_id = player_id_param
        GROUP BY p.id, p.first_name, p.last_name
        ORDER BY games_played_together DESC
        LIMIT 5
    )
    SELECT json_build_object(
        'wins', (SELECT COUNT(*) FROM player_matches WHERE is_win = true),
        'losses', (SELECT COUNT(*) FROM player_matches WHERE is_win = false),
        'common_teammates', (SELECT json_agg(json_build_object('id', id, 'first_name', first_name, 'last_name', last_name, 'games_played_together', games_played_together)) FROM common_teammates)
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql;

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
-- 3. TEAMS TABLE
-- Stores teams, each consisting of two players.
-- ----------------------------
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    player1_id UUID REFERENCES public.profiles(id),
    player2_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_team_players CHECK (player1_id <> player2_id)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public teams are viewable by everyone."
  ON teams FOR SELECT
  USING ( TRUE );

CREATE POLICY "Authenticated users can create teams."
  ON teams FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Team members can update their own team."
  ON teams FOR UPDATE
  USING ( auth.uid() = player1_id OR auth.uid() = player2_id );

CREATE POLICY "Team members can delete their own team."
  ON teams FOR DELETE
  USING ( auth.uid() = player1_id OR auth.uid() = player2_id );

-- ----------------------------
-- 4. TOURNAMENTS TABLE
-- Stores tournament information.
-- ----------------------------
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id UUID REFERENCES public.profiles(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
    structure TEXT CHECK (structure IN ('single_elimination', 'double_elimination')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tournaments are viewable by everyone."
  ON tournaments FOR SELECT
  USING ( TRUE );

CREATE POLICY "Authenticated users can create tournaments."
  ON tournaments FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Tournament creators can update their tournaments."
  ON tournaments FOR UPDATE
  USING ( auth.uid() = creator_id );

CREATE POLICY "Tournament creators can delete their tournaments."
  ON tournaments FOR DELETE
  USING ( auth.uid() = creator_id );

-- ----------------------------
-- 5. TOURNAMENT PARTICIPANTS TABLE
-- A join table between tournaments and teams.
-- ----------------------------
CREATE TABLE tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    
    UNIQUE(tournament_id, team_id)
);

ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public participant list is viewable by everyone."
  ON tournament_participants FOR SELECT
  USING ( TRUE );

CREATE POLICY "Tournament creators can add teams."
  ON tournament_participants FOR INSERT
  WITH CHECK ( auth.uid() IN (SELECT creator_id FROM tournaments WHERE id = tournament_id) );

CREATE POLICY "Tournament creators can remove teams."
  ON tournament_participants FOR DELETE
  USING ( auth.uid() IN (SELECT creator_id FROM tournaments WHERE id = tournament_id) );

-- ----------------------------
-- 6. MATCHES TABLE
-- Stores match information for tournaments.
-- ----------------------------
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_number INTEGER,
    team1_id UUID REFERENCES public.teams(id),
    team2_id UUID REFERENCES public.teams(id),
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    winner_id UUID REFERENCES public.teams(id),
    status TEXT CHECK (status IN ('scheduled', 'ongoing', 'completed', 'locked')) DEFAULT 'scheduled',
    start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public matches are viewable by everyone."
  ON matches FOR SELECT
  USING ( TRUE );

CREATE POLICY "Tournament creators can create matches."
  ON matches FOR INSERT
  WITH CHECK ( auth.uid() IN (SELECT creator_id FROM tournaments WHERE id = tournament_id) );

CREATE POLICY "Tournament creators can update matches."
  ON matches FOR UPDATE
  USING ( auth.uid() IN (SELECT creator_id FROM tournaments WHERE id = tournament_id) );

-- ----------------------------
-- 7. BETS TABLE
-- Stores user bets on matches or tournaments.
-- ----------------------------
CREATE TABLE bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('match_winner', 'tournament_winner')),
    status TEXT CHECK (status IN ('active', 'won', 'lost')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT bet_on_one_target CHECK (
        (match_id IS NOT NULL AND tournament_id IS NULL) OR
        (match_id IS NULL AND tournament_id IS NOT NULL)
    ),
    CONSTRAINT positive_bet_amount CHECK (amount > 0)
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets."
  ON bets FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can place bets."
  ON bets FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users cannot update their bets."
  ON bets FOR UPDATE
  USING ( false ); 
'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

interface Player {
  id: string;
  first_name: string;
  last_name: string | null;
}

interface Teammate {
    id: string;
    first_name: string;
    last_name: string | null;
    games_played_together: number;
}

interface PlayerStats {
  wins: number;
  losses: number;
  common_teammates: Teammate[] | null;
}

interface PlayerPageProps {
    params: {
        id: string;
    }
}

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
)

export default function PlayerPage({ params }: PlayerPageProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    fetchUser();
    
    const fetchPlayerStats = async () => {
        setLoading(true);
        const response = await fetch(`/api/players/${params.id}/stats`);
        if(response.ok) {
            const data = await response.json();
            setPlayer(data.player);
            setStats(data.stats);
        } else {
            setError('Failed to fetch player data.');
        }
        setLoading(false);
    }
    fetchPlayerStats();

  }, [supabase, params.id]);
  
  const winPercentage = stats && (stats.wins + stats.losses > 0) 
    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) + '%' 
    : 'N/A';

  if (loading) return <div className="text-center py-10">Loading player profile...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!player) return <div className="text-center py-10">Player not found.</div>;

  return (
    <div>
      <Header user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900">{player.first_name} {player.last_name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Wins" value={stats?.wins ?? 0} />
            <StatCard label="Losses" value={stats?.losses ?? 0} />
            <StatCard label="Win Rate" value={winPercentage} />
        </div>

        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Common Teammates</h2>
            {stats?.common_teammates && stats.common_teammates.length > 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <ul className="divide-y divide-gray-200">
                        {stats.common_teammates.map(teammate => (
                            <li key={teammate.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <Link href={`/players/${teammate.id}`} className="text-lg font-semibold text-green-600 hover:underline">
                                        {teammate.first_name} {teammate.last_name}
                                    </Link>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg text-gray-800">{teammate.games_played_together}</p>
                                    <p className="text-sm text-gray-500">games together</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-gray-500">No teammate data available.</p>
            )}
        </div>
      </div>
    </div>
  );
} 
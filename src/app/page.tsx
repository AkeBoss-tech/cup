'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Link from "next/link";

interface Player {
  id: string;
  first_name: string;
  last_name: string | null;
}

interface Tournament {
    id: string;
    name: string;
}

const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <div className="bg-white p-4 rounded-2xl shadow-md transition-transform hover:scale-105">
        <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h3 className="font-bold text-xl mt-4">{tournament.name}</h3>
        <Link href={`/tournaments/${tournament.id}`} className="text-sm text-green-600 hover:underline mt-2 inline-block">
            View Details
        </Link>
    </div>
)

const ActionCard = () => (
    <div className="bg-yellow-400 p-6 rounded-2xl flex flex-col items-start transition-shadow hover:shadow-xl">
        <h3 className="text-2xl font-bold">Create a Tournament</h3>
        <p className="mt-2 text-gray-800">Ready to make your mark?</p>
        <Link href="/tournaments/create" className="mt-4 font-bold text-gray-900 group">
            Get Started <span className="transition-transform group-hover:translate-x-1 inline-block">&rarr;</span>
        </Link>
    </div>
)

const PlayerSearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const fetchPlayers = async () => {
            setLoading(true);
            const response = await fetch(`/api/players/search?q=${query}`);
            const data = await response.json();
            setResults(data);
            setLoading(false);
        };

        const timeoutId = setTimeout(fetchPlayers, 300);
        return () => clearTimeout(timeoutId);

    }, [query]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a player..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
            />
            {loading && <p className="absolute right-4 top-4 text-sm text-gray-500">Searching...</p>}
            {results.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {results.map(player => (
                        <li key={player.id} className="p-4 hover:bg-gray-100">
                            <Link href={`/players/${player.id}`} className="block">
                                {player.first_name} {player.last_name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingUser(false);
    };
    fetchUser();
    
    const fetchTournaments = async () => {
        const { data, error } = await supabase.from('tournaments').select('*').limit(6);
        if (data) {
            setTournaments(data);
        }
    }
    fetchTournaments();

  }, [supabase]);

  if (loadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <Header user={user} />
        
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-gray-900">Welcome to the Cup</h1>
                <p className="text-xl text-gray-600 mt-4">The ultimate pickleball tournament platform.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Recent Tournaments</h2>
                    {tournaments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                        </div>
                    ) : (
                        <p>No tournaments found.</p>
                    )}
                </div>
                
                <div className="space-y-8">
                    <ActionCard />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Find a Player</h2>
                        <PlayerSearchBar />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

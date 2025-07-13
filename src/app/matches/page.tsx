'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

interface Player {
  id: string;
  first_name: string;
  last_name: string | null;
}

interface Match {
    id: string;
    match_datetime: string | null;
    round_number: number | null;
    tournament_id: string | null;
    participants: {
        team_id: number;
        player: Player
    }[];
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('matches')
        .select('*, participants:match_participants(team_id, player:players(*))')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        setError(error.message)
      } else {
        setMatches(data as any)
      }
      setLoading(false)
    }

    fetchMatches()
  }, [supabase])

  const getTeamMembers = (match: Match, teamId: number) => {
      return match.participants.filter(p => p.team_id === teamId).map(p => p.player)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">All Matches</h1>
            {/* This would link to a page for creating a standalone match */}
            {/* <Link href="/matches/create">
              <a className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Create New Match
              </a>
            </Link> */}
        </div>

        {loading && <p className="text-center">Loading matches...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {matches.length > 0 ? (
            <div className="space-y-6">
                {matches.map(match => {
                    const team1 = getTeamMembers(match, 1)
                    const team2 = getTeamMembers(match, 2)
                    
                    return (
                        <div key={match.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                             <div className="flex justify-between items-center">
                                <div className="flex-grow">
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <div className="text-center">
                                            <p className="font-semibold text-lg text-blue-600">
                                                {team1.map((p, i) => <span key={p.id}><Link href={`/players/${p.id}`} className="hover:underline">{p.first_name} {p.last_name || ''}</Link>{i < team1.length - 1 && ' & '}</span>)}
                                            </p>
                                        </div>
                                        <div className="text-center font-bold text-gray-500">vs.</div>
                                        <div className="text-center">
                                            <p className="font-semibold text-lg text-red-600">
                                                {team2.map((p, i) => <span key={p.id}><Link href={`/players/${p.id}`} className="hover:underline">{p.first_name} {p.last_name || ''}</Link>{i < team2.length - 1 && ' & '}</span>)}
                                            </p>
                                         </div>
                                     </div>
                                </div>
                            </div>
                            <div className="text-center mt-2 text-sm text-gray-500">
                                <p>
                                    {match.match_datetime ? new Date(match.match_datetime).toLocaleDateString() : 'Date TBD'}
                                </p>
                                {match.tournament_id && <Link href={`/tournaments/${match.tournament_id}`} className="text-blue-500 hover:underline">Part of a tournament</Link>}
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            !loading && <p className="text-center text-gray-500">No matches found.</p>
        )}
      </div>
    </AuthGuard>
  )
} 
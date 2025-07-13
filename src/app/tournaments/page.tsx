'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

type Tournament = {
  id: string;
  name: string;
  status: string;
  structure: string;
}

export default function TournamentsPage() {
  const supabase = createClient()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchTournamentsAndUser = async () => {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null)

      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, status, structure')
      
      if (data) {
        setTournaments(data)
      }
      setLoading(false)
    }
    fetchTournamentsAndUser()
  }, [supabase])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Tournaments</h1>
        {user && (
            <Link
                href="/tournaments/create"
                className="px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
            >
                Create Tournament
            </Link>
        )}
      </div>
      <div className="bg-white p-8 rounded-lg shadow">
        {loading ? (
          <p>Loading tournaments...</p>
        ) : tournaments.length > 0 ? (
          <ul className="space-y-4">
            {tournaments.map((tournament) => (
              <li key={tournament.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <Link href={`/tournaments/${tournament.id}`} className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-green-700">{tournament.name}</h2>
                    <p className="text-sm text-gray-600 capitalize">{tournament.structure.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-sm font-semibold uppercase px-3 py-1 bg-green-200 text-green-800 rounded-full">
                    {tournament.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No tournaments have been created yet. Be the first!</p>
        )}
      </div>
    </div>
  )
} 
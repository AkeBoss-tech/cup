'use client'

import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

type Team = {
  id: string;
  name: string;
  player1_username: string;
  player2_username: string;
}

export default function TeamsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndTeams = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        const { data, error } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            player1:player1_id(username),
            player2:player2_id(username)
          `)
          .or(`player1_id.eq.${currentUser.id},player2_id.eq.${currentUser.id}`)
        
        if (data) {
          const formattedData = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            player1_username: t.player1.username,
            player2_username: t.player2.username
          }));
          setTeams(formattedData)
        }
      }
      setLoading(false)
    }
    fetchUserAndTeams()
  }, [supabase])

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">My Teams</h1>
          <Link
            href="/teams/create"
            className="px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Create New Team
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          {loading ? (
            <p>Loading teams...</p>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="p-6 border rounded-lg bg-gray-50">
                  <h2 className="text-2xl font-bold text-green-700">{team.name}</h2>
                  <p className="text-md text-gray-600 mt-2">
                    {team.player1_username} & {team.player2_username}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You are not a part of any teams yet.</p>
          )}
        </div>
      </div>
    </AuthGuard>
  )
} 
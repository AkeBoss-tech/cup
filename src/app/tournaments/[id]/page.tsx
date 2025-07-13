'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Tournament = {
  id: string;
  name: string;
  status: string;
  structure: string;
  creator_id: string;
}

type Team = {
  id: string;
  name: string;
}

type Participant = {
  id: string;
  team: {
    name: string;
  }
}

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTournamentData = useCallback(async (tournamentId: string) => {
    // Fetch tournament details
    const { data: tournamentData, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) {
      setError('Tournament not found.')
      setTournament(null)
      return
    }
    setTournament(tournamentData)

    // Fetch participating teams
    const { data: participantsData } = await supabase
      .from('tournament_participants')
      .select(`id, team:teams(name)`)
      .eq('tournament_id', tournamentId)
    
    if (participantsData) setParticipants(participantsData as any)
  }, [supabase])

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true)
      // Resolve the params Promise
      const { id } = await params
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      await fetchTournamentData(id)

      // Fetch all teams for the creator's dropdown
      if (currentUser && tournament?.creator_id && currentUser.id === tournament.creator_id) {
        const { data: allTeamsData } = await supabase.from('teams').select('id, name')
        if (allTeamsData) setTeams(allTeamsData)
      }
      
      setLoading(false)
    }
    initialFetch()
  }, [fetchTournamentData, params, supabase, tournament?.creator_id])

  const isCreator = user?.id === tournament?.creator_id

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return

    const { id } = await params // Resolve params for the tournament ID
    const { error } = await supabase
      .from('tournament_participants')
      .insert({ tournament_id: id, team_id: selectedTeam })

    if (error) {
      setError(error.message)
    } else {
      setSelectedTeam('')
      await fetchTournamentData(id) // Refresh participants
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <p>Loading tournament details...</p>
      ) : tournament ? (
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">{tournament.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold uppercase px-4 py-2 bg-green-200 text-green-800 rounded-full">
                  {tournament.status}
                </span>
                <span className="text-lg text-gray-600 capitalize">
                  {tournament.structure.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Team Management for Creator */}
          {isCreator && tournament.status === 'upcoming' && (
            <div className="mt-8 bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Teams</h2>
              <form onSubmit={handleAddTeam} className="flex items-center gap-4">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a team to add</option>
                  {teams
                    .filter(team => !participants.some(p => p.team.name === team.name))
                    .map(team => <option key={team.id} value={team.id}>{team.name}</option>)
                  }
                </select>
                <button type="submit" className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Add Team</button>
              </form>
            </div>
          )}

          {/* Participants List */}
          <div className="mt-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Participants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {participants.length > 0 ? participants.map(p => (
                <div key={p.id} className="p-4 bg-gray-100 rounded-lg text-center">
                  <span className="font-semibold">{p.team.name}</span>
                </div>
              )) : (
                <p className="text-gray-500">No teams have been added yet.</p>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tournament Bracket</h2>
            <p>The tournament bracket will be displayed here once the tournament starts.</p>
          </div>
        </div>
      ) : (
        <p>Tournament not found.</p>
      )}
    </div>
  )
}
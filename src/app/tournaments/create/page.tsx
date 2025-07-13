'use client'

import { useState, useEffect, useCallback } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Bracket from '@/components/Bracket'

interface Team {
  id: string;
  name: string;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string | null;
}

export default function CreateTournamentPage() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([])
  const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const fetchTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
    
    if (data) {
      setTeams(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchTeams()

    const fetchPlayers = async () => {
      const { data, error } = await supabase.from('players').select('*')
      if(data) {
        setAllPlayers(data)
      }
    }
    fetchPlayers()
  }, [supabase, fetchTeams])

  const toggleTeamSelection = (team: Team) => {
    if (selectedTeams.find(t => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter(t => t.id !== team.id))
    } else {
      setSelectedTeams([...selectedTeams, team])
    }
  }

  const handlePlayerSelection = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 2) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (selectedPlayers.length !== 2) {
      setError("Please select exactly two players to form a team.")
      return
    }
    if (!newTeamName.trim()) {
      setError("Please provide a team name.")
      return
    }
    
    setLoading(true)
    // 1. Create the team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({ name: newTeamName })
      .select()
      .single()

    if (teamError) {
      setError(teamError.message)
      setLoading(false)
      return
    }

    // 2. Associate players with the team
    const teamPlayersToInsert = selectedPlayers.map(p => ({
      team_id: teamData.id,
      player_id: p.id,
    }))

    const { error: teamPlayersError } = await supabase
      .from('team_players')
      .insert(teamPlayersToInsert)

    if (teamPlayersError) {
      setError(teamPlayersError.message)
      // Attempt to clean up by deleting the created team
      await supabase.from('teams').delete().match({ id: teamData.id })
    } else {
      // Success
      setCreateTeamModalOpen(false)
      setNewTeamName('')
      setSelectedPlayers([])
      fetchTeams() // Refresh the list of teams
    }
    setLoading(false)
  }
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedTeams.length < 2) {
      setError('You need at least 2 teams for a tournament.')
      return
    }

    if (selectedTeams.length % 2 !== 0) {
      setError('The number of teams must be even to create matches.')
      return
    }

    setLoading(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 1. Create the tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .insert({ 
          name, 
          created_by: user.id
        })
        .select()
        .single()

      if (tournamentError) {
        setError(tournamentError.message)
        setLoading(false)
        return
      }

      // 2. Create matches for pairs of teams
      const matchesToCreate = []
      for (let i = 0; i < selectedTeams.length; i += 2) {
        matchesToCreate.push({
          tournament_id: tournamentData.id,
          team_1_id: selectedTeams[i].id,
          team_2_id: selectedTeams[i+1].id,
          round_number: 1
        })
      }

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .insert(matchesToCreate)
        .select()

      if (matchesError) {
        setError("Failed to create matches: " + matchesError.message)
        // TODO: Here you might want to delete the created tournament for cleanup
        setLoading(false)
        return
      }
      
      router.push(`/tournaments/${tournamentData.id}`)

    } else {
      setError('You must be logged in to create a tournament.')
    }
    setLoading(false)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Create a New Tournament</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tournament Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Team Management */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Select Teams</h2>
                <button type="button" onClick={() => setCreateTeamModalOpen(true)} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Create New Team
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {teams.map(team => (
                  <div 
                    key={team.id} 
                    onClick={() => toggleTeamSelection(team)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTeams.find(t => t.id === team.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <p className="font-semibold text-gray-900">{team.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedTeams.length > 0 && (
              <div className="mt-8">
                <Bracket teams={selectedTeams} />
              </div>
            )}
                
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>

        {/* Create Team Modal */}
        {isCreateTeamModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full z-50">
              <h2 className="text-2xl font-bold mb-6">Create a New Team</h2>
              {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
              
              <div className="mb-4">
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                      type="text"
                      id="teamName"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="e.g., The Champions"
                  />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Select Two Players ({selectedPlayers.length}/2)</h3>
                <div className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md">
                  {allPlayers.map(player => (
                    <div
                      key={player.id}
                      onClick={() => handlePlayerSelection(player)}
                      className={`p-3 rounded-md cursor-pointer border-2 ${selectedPlayers.find(p => p.id === player.id) ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {player.first_name} {player.last_name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={() => setCreateTeamModalOpen(false)} className="py-2 px-4 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={handleCreateTeam} disabled={loading || selectedPlayers.length !== 2 || !newTeamName.trim()} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
} 
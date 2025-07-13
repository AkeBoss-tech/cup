'use client'

import { useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('')
  const [partnerUsername, setPartnerUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      if (user.user_metadata?.username === partnerUsername) {
        setError("You can't invite yourself to a team.")
        setLoading(false)
        return
      }

      // 1. Find the partner by username
      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', partnerUsername)
        .single()

      if (partnerError || !partnerData) {
        setError('Could not find a user with that username.')
        setLoading(false)
        return
      }

      // 2. Create the team
      const { data, error: insertError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          player1_id: user.id,
          player2_id: partnerData.id,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        router.push('/teams')
      }
    } else {
      setError('You must be logged in to create a team.')
    }
    setLoading(false)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Create a New Team</h1>
        <div className="bg-white p-8 rounded-lg shadow max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                Team Name
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="partnerUsername" className="block text-sm font-medium text-gray-700">
                Partner's Username
              </label>
              <input
                id="partnerUsername"
                type="text"
                value={partnerUsername}
                onChange={(e) => setPartnerUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {loading ? 'Creating Team...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
} 
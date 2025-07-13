'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/AuthGuard'

type Tournament = {
  id: string;
  name: string;
  status: string;
  structure: string;
}

// Define the props type explicitly
type PageProps = {
  params: Promise<{ id: string }>;
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const supabase = createClient()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)

  const { id } = await params;

  useEffect(() => {
    const fetchTournament = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setTournament(data)
      }
      setLoading(false)
    }

    if (id) {
      fetchTournament()
    }
  }, [supabase, id])

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p>Loading tournament details...</p>
        ) : tournament ? (
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{tournament.name}</h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-lg font-semibold uppercase px-4 py-2 bg-green-200 text-green-800 rounded-full">
                {tournament.status}
              </span>
              <span className="text-lg text-gray-600 capitalize">
                {tournament.structure.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="mt-8 bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tournament Bracket</h2>
              <p>The tournament bracket will be displayed here.</p>
            </div>
          </div>
        ) : (
          <p>Tournament not found.</p>
        )}
      </div>
    </AuthGuard>
  )
} 
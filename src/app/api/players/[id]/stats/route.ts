import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const supabase = createClient()
  const { params } = context;
  const playerId = params.id

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .select('id, first_name, last_name')
    .eq('id', playerId)
    .single()
  
  if (playerError) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const { data, error } = await supabase.rpc('get_player_stats', { player_id_param: playerId })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
      player: playerData,
      stats: data
  })
} 
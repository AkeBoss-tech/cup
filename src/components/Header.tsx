'use client'

import type { User } from '@supabase/supabase-js'

export default function Header({ user }: { user: User | null }) {
    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome to the Cash Money Cup</h1>
                <p className="text-gray-500">
                    {user ? `Ready to bet, ${user.user_metadata.username}?` : 'The best place for pickleball action.'}
                </p>
            </div>
            {/* Search and other icons can go here */}
        </header>
    )
} 
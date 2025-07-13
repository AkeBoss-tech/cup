'use client'

import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors duration-200">
    {children}
  </Link>
);

const UserProfile = ({ user, onLogout }: { user: User, onLogout: () => void }) => (
  <div className="mt-auto">
    <div className="p-4 border-t border-gray-200">
      <p className="font-semibold text-sm truncate">{user.email}</p>
      <button 
        onClick={onLogout}
        className="w-full mt-2 text-left text-sm text-red-500 hover:text-red-700"
      >
        Logout
      </button>
    </div>
  </div>
);

const LoginButton = () => (
    <div className="mt-auto p-4">
        <Link href="/login" className="block w-full text-center px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200">
            Login / Sign Up
        </Link>
  </div>
);


export default function Sidebar({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  return (
    <aside className="flex-col w-64 bg-white border-r border-gray-200 hidden sm:flex">
      <div className="p-6">
        <Link href="/" className="text-3xl font-black text-green-600">
          CashMoney
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/tournaments">Tournaments</NavLink>
        {user && <NavLink href="/teams">My Teams</NavLink>}
      </nav>
      {user ? <UserProfile user={user} onLogout={onLogout} /> : <LoginButton />}
    </aside>
  )
} 
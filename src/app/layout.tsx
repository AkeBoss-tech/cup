'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch initial user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect or update UI after logout
    window.location.href = '/';
  }

  return (
    <html lang="en">
      <body className="bg-white text-black">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <Link href="/" className="text-2xl font-bold text-green-600">
              Cash Money Cup 🥒🎾
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span>Hey, {user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="py-2 px-4 rounded-md no-underline bg-gray-200 hover:bg-gray-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-3 flex rounded-md no-underline bg-gray-200 hover:bg-gray-300"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}

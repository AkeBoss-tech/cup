'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Simple SVG icons for decoration
const PickleballIcon = () => (
  <svg className="w-16 h-16 text-green-500 inline-block animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM12 14c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM10 11c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM14 11c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" /></svg>
);

const TrophyIcon = () => (
  <svg className="w-12 h-12 text-yellow-400 inline-block mx-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.707 3.293a1 1 0 00-1.414 0L12 7.586 7.707 3.293a1 1 0 00-1.414 1.414L10.586 9H5a1 1 0 100 2h5.586l-4.293 4.293a1 1 0 101.414 1.414L12 12.414l4.293 4.293a1 1 0 001.414-1.414L13.414 11H19a1 1 0 100-2h-5.586l4.293-4.293a1 1 0 000-1.414z" /></svg>
);

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  return (
    <div className="flex flex-col items-center justify-center text-center w-full min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10">
          <PickleballIcon />
          <h1 className="text-7xl md:text-8xl font-black uppercase text-gray-800 tracking-tighter">
            The <span className="text-green-600">Cash Money</span> Cup
            <TrophyIcon />
          </h1>
          <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
            The #1 place for Pickleball tournaments, betting, and glory. 
            Create tournaments, track live scores, and bet on your favorite teams with PickleCash.
          </p>
          
          {loading ? (
            <div className="h-12 mt-8"></div> // Placeholder for button
          ) : !user ? (
            <Link
              href="/login"
              className="mt-8 inline-block px-10 py-4 font-bold text-white bg-green-600 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 animate-pulse-glow"
            >
              Get Started
            </Link>
          ) : (
            <Link
              href="/tournaments"
              className="mt-8 inline-block px-10 py-4 font-bold text-white bg-green-600 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              View Tournaments
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

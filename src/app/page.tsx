'use client'

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Link from "next/link";

const PromoCard = () => (
    <div className="bg-green-600 text-white p-8 rounded-2xl flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-black">-50% OFF</h2>
        <p className="mt-2 font-semibold">your first bet!</p>
        <p className="text-sm mt-1">Sign up now to claim your bonus.</p>
        <img src="https://loremflickr.com/400/300/pickleball,sports" alt="Pickleball match" className="mt-4 rounded-lg w-full h-40 object-cover"/>
    </div>
)

const TournamentCard = ({ name, location, image }: { name: string, location: string, image: string }) => (
    <div className="bg-white p-4 rounded-2xl shadow-md">
        <img src={image} alt={name} className="w-full h-40 object-cover rounded-lg"/>
        <h3 className="font-bold text-xl mt-4">{name}</h3>
        <p className="text-sm text-gray-500">{location}</p>
        <div className="flex items-center justify-between mt-4">
            <span className="font-bold text-lg">$25</span>
            <button className="bg-green-200 text-green-800 font-bold w-10 h-10 rounded-full">+</button>
        </div>
    </div>
)

const ActionCard = () => (
    <div className="bg-yellow-400 p-6 rounded-2xl flex flex-col items-start">
        <h3 className="text-2xl font-bold">Create a Tournament</h3>
        <p className="mt-2 text-gray-800">Become a legend.</p>
        <Link href="/tournaments/create" className="mt-4 font-bold text-gray-900">Learn more &rarr;</Link>
    </div>
)

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
    <div>
        <Header user={user} />
        
        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-8">

            {/* Left/Main Column */}
            <div className="flex-1">
                {/* Filters */}
                <div className="flex space-x-4 mb-6">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold">All</button>
                    <button className="px-6 py-2 bg-white text-gray-600 rounded-full font-semibold">Upcoming</button>
                    <button className="px-6 py-2 bg-white text-gray-600 rounded-full font-semibold">Ongoing</button>
                    <button className="px-6 py-2 bg-white text-gray-600 rounded-full font-semibold">Completed</button>
                </div>
                
                {/* Featured Tournaments */}
                <div className="flex flex-col space-y-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <TournamentCard name="Summer Smash" location="Miami, FL" image="https://loremflickr.com/320/240/pickleball,court" />
                        <TournamentCard name="Desert Duel" location="Phoenix, AZ" image="https://loremflickr.com/320/240/pickleball,sun" />
                        <TournamentCard name="City Slam" location="New York, NY" image="https://loremflickr.com/320/240/pickleball,city" />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-full xl:w-96 flex flex-col gap-8">
                <PromoCard />
                <ActionCard />
            </div>
        </div>
    </div>
  );
}

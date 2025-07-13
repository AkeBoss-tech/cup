import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col items-center flex-1 w-full gap-20">
      <div className="flex flex-col items-center justify-center flex-1 max-w-4xl px-3 py-16 mx-auto text-center gap-6">
        <h1 className="text-6xl font-extrabold text-green-600">
          Cash Money Cup 🥒🎾
        </h1>
        <p className="text-lg text-gray-700">
          The #1 place for Pickleball tournaments, betting, and glory.
        </p>
        <p className="text-gray-600">
          Create tournaments, track live scores, and bet on your favorite teams
          with PickleCash.
        </p>
        {!user && (
          <Link
            href="/login"
            className="px-6 py-3 mt-4 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Get Started
          </Link>
        )}
         {user && (
          <Link
            href="/tournaments"
            className="px-6 py-3 mt-4 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            View Tournaments
          </Link>
        )}
      </div>
    </div>
  );
}

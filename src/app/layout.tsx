import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Cash Money Cup",
  description: "The premier Pickleball tournament for cash money.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-white text-black">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <Link href="/" className="text-2xl font-bold text-green-600">
              Cash Money Cup 🥒🎾
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                Hey, {user.email}
                <form action="/auth/sign-out" method="post">
                  <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                    Logout
                  </button>
                </form>
              </div>
            )}
            {!user && (
              <Link
                href="/login"
                className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
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

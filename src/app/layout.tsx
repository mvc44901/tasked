import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tasked — Get it done",
  description: "Post what you need. Freelancers come to you. Secure escrow payments powered by Stripe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-50">{children}</main>
        <footer className="border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <span className="font-semibold text-gray-800">Tasked</span>
                <span className="text-gray-300 text-sm">·</span>
                <span className="text-gray-400 text-sm">Get it done</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <Link href="/tasks" className="hover:text-gray-600 transition-colors">Browse Tasks</Link>
                <Link href="/post-task" className="hover:text-gray-600 transition-colors">Post a Task</Link>
                <span>© {new Date().getFullYear()} Tasked</span>
              </div>
            </div>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}

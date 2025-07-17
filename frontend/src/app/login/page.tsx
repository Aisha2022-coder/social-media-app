"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const axios = (await import("@/lib/axios")).default;
      const res = await axios.post("/auth/login", { email, password });
      // Save token to localStorage
      localStorage.setItem("token", res.data.accessToken);
      router.push("/timeline");
    } catch {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 relative overflow-hidden font-sans">
      {/* Decorative blurred circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300 opacity-30 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400 opacity-30 rounded-full blur-3xl z-0" />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="w-full bg-white/80 backdrop-blur-lg border-2 border-indigo-400 shadow-2xl rounded-2xl px-8 py-10 flex flex-col gap-6 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-indigo-700 text-center tracking-tight font-[Poppins,Inter,sans-serif]">Welcome Back</h1>
          <p className="text-gray-500 text-center text-base font-medium">Sign in to your account</p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-base font-medium text-gray-700 placeholder-gray-400 transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-base font-medium text-gray-700 placeholder-gray-400 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <div className="text-red-500 text-sm text-center font-semibold">{error}</div>}
            <Button
              type="submit"
              className="w-fit mx-auto px-8 py-2 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-pink-400 shadow-lg hover:from-pink-400 hover:to-indigo-500 transition-all duration-200"
              style={{ minWidth: 120 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-600 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-pink-500 hover:underline font-semibold transition">Sign up</Link>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
}

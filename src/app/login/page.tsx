"use client";

import { createClient } from "@/lib/supabase/client";
import { Compass, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = getSupabase();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link!");
      }
    } else {
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-wander-charcoal flex items-center justify-center px-4 grain-overlay">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-wander-copper to-wander-copper-light flex items-center justify-center shadow-lg shadow-wander-copper/20 mb-4">
            <Compass className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h1
            className="text-2xl font-semibold text-wander-cream tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            WanderAI
          </h1>
          <p className="text-wander-cream/50 text-sm mt-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-wander-slate/20 border border-wander-slate/30 text-wander-cream/90 hover:bg-wander-slate/30 hover:border-wander-slate/50 transition-all duration-200 text-sm font-medium mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-wander-slate/20" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-wander-charcoal px-3 text-wander-cream/40">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-wander-cream/60 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-wander-slate/20 border border-wander-slate/30 text-wander-cream placeholder:text-wander-slate/50 focus:outline-none focus:border-wander-copper/50 focus:bg-wander-slate/30 transition-all duration-200 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-wander-cream/60 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg bg-wander-slate/20 border border-wander-slate/30 text-wander-cream placeholder:text-wander-slate/50 focus:outline-none focus:border-wander-copper/50 focus:bg-wander-slate/30 transition-all duration-200 text-sm"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2 border border-red-400/20">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-400 text-xs bg-green-400/10 rounded-lg px-3 py-2 border border-green-400/20">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-wander-copper hover:bg-wander-copper-light text-white font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-wander-copper/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-wander-cream/50 text-xs mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-wander-copper-light hover:text-wander-copper transition-colors underline underline-offset-2"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

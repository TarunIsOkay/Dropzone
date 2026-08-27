"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <Link href="/landing" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-dz-crimson flex items-center justify-center">
          <span className="text-white font-bold text-sm">DZ</span>
        </div>
        <span className="font-bold text-lg tracking-tight">DROPZONE</span>
      </Link>

      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-dz-text-muted mb-8">
        Sign in to your account to continue
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-dz-text-dim hover:text-dz-text-muted transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-dz-border bg-dz-elevated text-dz-crimson focus:ring-dz-crimson/50"
            />
            <span className="text-sm text-dz-text-muted">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-dz-crimson-400 hover:text-dz-crimson-300"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-sm text-dz-text-muted text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-dz-crimson-400 hover:text-dz-crimson-300 font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dz-bg flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Suspense fallback={<div className="w-full max-w-sm h-96 dz-skeleton" />}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-dz-surface border-l border-dz-border relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="relative text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-dz-crimson/10 border border-dz-crimson/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-dz-crimson text-2xl font-black">DZ</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">DROPZONE</h2>
          <p className="text-dz-text-muted text-sm leading-relaxed max-w-xs">
            The competitive esports platform built for Free Fire. Join thousands
            of players competing at the highest level.
          </p>
        </div>
      </div>
    </div>
  );
}

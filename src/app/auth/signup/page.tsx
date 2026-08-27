"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dz-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-dz-green/10 border border-dz-green/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-dz-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-sm text-dz-text-muted mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click the
            link to verify your account.
          </p>
          <Link href="/auth/login">
            <Button variant="secondary" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dz-bg flex">
      {/* Left panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <Link href="/landing" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-dz-crimson flex items-center justify-center">
              <span className="text-white font-bold text-sm">DZ</span>
            </div>
            <span className="font-bold text-lg tracking-tight">DROPZONE</span>
          </Link>

          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-dz-text-muted mb-8">
            Join the competitive esports community
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <Input
              label="Username"
              placeholder="ghost_sniper"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

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
                placeholder="Min. 8 characters"
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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-sm text-dz-text-muted text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-dz-crimson-400 hover:text-dz-crimson-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-dz-surface border-l border-dz-border relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="relative text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-dz-crimson/10 border border-dz-crimson/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-dz-crimson text-2xl font-black">DZ</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">JOIN THE ARENA</h2>
          <p className="text-dz-text-muted text-sm leading-relaxed max-w-xs">
            Create your profile, find your squad, and start competing in
            tournaments today.
          </p>
        </div>
      </div>
    </div>
  );
}

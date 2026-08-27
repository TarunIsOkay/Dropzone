"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    );

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
            <CheckCircle className="w-8 h-8 text-dz-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-sm text-dz-text-muted mb-6">
            If an account exists with <strong>{email}</strong>, we&apos;ve sent
            a password reset link.
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
    <div className="min-h-screen bg-dz-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/landing" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-dz-crimson flex items-center justify-center">
            <span className="text-white font-bold text-sm">DZ</span>
          </div>
          <span className="font-bold text-lg tracking-tight">DROPZONE</span>
        </Link>

        <h1 className="text-2xl font-bold mb-1">Reset password</h1>
        <p className="text-sm text-dz-text-muted mb-8">
          Enter your email and we&apos;ll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            Send Reset Link
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-sm text-dz-text-muted hover:text-dz-text mt-6 justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

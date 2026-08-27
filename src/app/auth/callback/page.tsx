"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.push("/dashboard");
        router.refresh();
      });
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-dz-crimson animate-spin" />
      <p className="text-sm text-dz-text-muted">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-dz-bg flex items-center justify-center">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-dz-crimson animate-spin" />
            <p className="text-sm text-dz-text-muted">Loading...</p>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}

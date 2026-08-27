"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const [user, setUser] = useState<null | { id: string; email: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email || "" } : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(
          session?.user
            ? { id: session.user.id, email: session.user.email || "" }
            : null
        );
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useRealtimeMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    setLoading(true);

    supabase
      .from("messages")
      .select(`*, profiles:user_id(username, display_name, avatar_url)`)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setMessages((data || []).reverse());
        setLoading(false);
      });

    const channel: RealtimeChannel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("user_id", (payload.new as { user_id: string }).user_id)
            .single()
            .then(({ data: profile }) => {
              setMessages((prev) => [
                ...prev,
                { ...payload.new, profiles: profile },
              ]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return { messages, loading };
}

export function useRealtimeNotifications(userId: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)
      .then(({ count: c }) => setCount(c || 0));

    const channel: RealtimeChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => setCount((prev) => prev + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}

export function useMatches(tournamentId?: string) {
  const [matches, setMatches] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("matches")
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name, tag),
        team2:teams!matches_team2_id_fkey(id, name, tag)
      `)
      .order("scheduled_at", { ascending: true });

    if (tournamentId) {
      query = query.eq("tournament_id", tournamentId);
    }

    const { data } = await query;
    setMatches(data || []);
    setLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, refetch: fetchMatches };
}

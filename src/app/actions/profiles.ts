"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: {
    display_name?: string;
    bio?: string;
    region?: string;
    country?: string;
    ign?: string;
    game_uid?: string;
    primary_role?: string;
    experience?: string;
    looking_for_team?: boolean;
    discord_username?: string;
    youtube_url?: string;
    twitch_url?: string;
    twitter_url?: string;
    instagram_url?: string;
  }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/profile");
  return data;
}

export async function searchPlayers(query: string, filters?: {
  region?: string;
  role?: string;
  looking_for_team?: boolean;
  min_rating?: number;
  max_rating?: number;
}) {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("profiles")
    .select(`
      *,
      ratings(rating, global_rank)
    `)
    .ilike("username", `%${query}%`)
    .limit(20);

  if (filters?.region) {
    queryBuilder = queryBuilder.eq("region", filters.region);
  }
  if (filters?.role) {
    queryBuilder = queryBuilder.eq("primary_role", filters.role);
  }
  if (filters?.looking_for_team) {
    queryBuilder = queryBuilder.eq("looking_for_team", true);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

export async function getLeaderboard(region?: string, limit = 50) {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("ratings")
    .select(`
      *,
      profiles:user_id(username, display_name, avatar_url, region, primary_role)
    `)
    .order("rating", { ascending: false })
    .limit(limit);

  if (region) {
    queryBuilder = queryBuilder.eq("profiles.region", region);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

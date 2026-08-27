"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTeam(data: {
  name: string;
  tag: string;
  description?: string;
  region?: string;
  country?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: data.name,
      tag: data.tag,
      description: data.description,
      region: data.region,
      country: data.country,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/teams");
  return team;
}

export async function getTeams(filters?: {
  region?: string;
  recruiting?: boolean;
  search?: string;
}) {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("teams")
    .select(`
      *,
      team_members(count),
      team_statistics(total_matches, wins, booyahs, kd_ratio, win_rate)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters?.region) {
    queryBuilder = queryBuilder.eq("region", filters.region);
  }
  if (filters?.recruiting) {
    queryBuilder = queryBuilder.eq("is_recruiting", true);
  }
  if (filters?.search) {
    queryBuilder = queryBuilder.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

export async function getTeamById(teamId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_members(
        *,
        profiles:user_id(username, display_name, avatar_url, primary_role, region)
      ),
      team_statistics(*)
    `)
    .eq("id", teamId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeam(
  teamId: string,
  updates: {
    name?: string;
    tag?: string;
    description?: string;
    is_recruiting?: boolean;
    discord_url?: string;
  }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", teamId)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/teams");
  return data;
}

export async function joinTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: user.id,
    role: "member",
  });

  if (error) throw error;
  revalidatePath("/teams");
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/teams");
}

export async function removeMember(teamId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/teams");
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .update({ role })
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
  revalidatePath("/teams");
}

export async function getUserTeam(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select(`
      *,
      teams(*)
    `)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
}

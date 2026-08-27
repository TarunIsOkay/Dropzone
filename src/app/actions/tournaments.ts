"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTournament(data: {
  name: string;
  description?: string;
  game: string;
  format: string;
  region?: string;
  max_teams: number;
  min_team_size: number;
  max_team_size: number;
  prize_pool?: string;
  entry_fee?: string;
  starts_at: string;
  registration_closes: string;
  rules?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      ...data,
      status: "draft",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/tournaments");
  return tournament;
}

export async function getTournaments(filters?: {
  status?: string;
  game?: string;
  region?: string;
}) {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("tournaments")
    .select(`
      *,
      tournament_registrations(count)
    `)
    .order("starts_at", { ascending: true });

  if (filters?.status && filters.status !== "all") {
    queryBuilder = queryBuilder.eq("status", filters.status);
  }
  if (filters?.game) {
    queryBuilder = queryBuilder.eq("game", filters.game);
  }
  if (filters?.region) {
    queryBuilder = queryBuilder.eq("region", filters.region);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

export async function getTournamentById(tournamentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(`
      *,
      tournament_registrations(
        *,
        teams(id, name, tag, logo_url)
      ),
      rounds(*),
      matches(*)
    `)
    .eq("id", tournamentId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTournamentStatus(
  tournamentId: string,
  status: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", tournamentId);

  if (error) throw error;
  revalidatePath("/tournaments");
}

export async function registerForTournament(
  tournamentId: string,
  teamId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("tournament_registrations").insert({
    tournament_id: tournamentId,
    team_id: teamId,
    status: "confirmed",
  });

  if (error) throw error;
  revalidatePath("/tournaments");
}

export async function unregisterFromTournament(
  tournamentId: string,
  teamId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tournament_registrations")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("team_id", teamId);

  if (error) throw error;
  revalidatePath("/tournaments");
}

export async function checkInToMatch(matchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("match_participants")
    .update({ checked_in: true })
    .eq("match_id", matchId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/tournaments");
}

export async function getMatchById(matchId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      tournament:tournaments(name, id),
      team1:teams!matches_team1_id_fkey(id, name, tag, logo_url),
      team2:teams!matches_team2_id_fkey(id, name, tag, logo_url),
      team3:teams!matches_team3_id_fkey(id, name, tag, logo_url),
      team4:teams!matches_team4_id_fkey(id, name, tag, logo_url),
      match_participants(
        *,
        profiles:user_id(username, display_name, avatar_url),
        teams:team_id(name, tag)
      )
    `)
    .eq("id", matchId)
    .single();

  if (error) throw error;
  return data;
}

export async function submitMatchResult(
  matchId: string,
  data: {
    placement: number;
    eliminations: number;
    evidence_url?: string;
    notes?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("results").insert({
    match_id: matchId,
    submitted_by: user.id,
    ...data,
  });

  if (error) throw error;
  revalidatePath("/tournaments");
}

export async function updateMatchStatus(
  matchId: string,
  status: string,
  extra?: { room_id?: string; room_password?: string; winner_id?: string }
) {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (extra?.room_id) updateData.room_id = extra.room_id;
  if (extra?.room_password) updateData.room_password = extra.room_password;
  if (extra?.winner_id) updateData.winner_id = extra.winner_id;

  const { error } = await supabase
    .from("matches")
    .update(updateData)
    .eq("id", matchId);

  if (error) throw error;
  revalidatePath("/tournaments");
}

export async function getRoomCredentials(matchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: participant, error: participantError } = await supabase
    .from("match_participants")
    .select("*, matches!inner(room_id, room_password, room_expires_at)")
    .eq("match_id", matchId)
    .eq("user_id", user.id)
    .single();

  if (participantError || !participant) {
    throw new Error("Not authorized to view room credentials");
  }

  const match = (participant as { matches: { room_id: string | null; room_password: string | null; room_expires_at: string | null } }).matches;
  if (match.room_expires_at && new Date(match.room_expires_at) < new Date()) {
    throw new Error("Room credentials have expired");
  }

  return {
    room_id: match.room_id,
    room_password: match.room_password,
  };
}

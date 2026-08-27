"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getAdminStats() {
  const supabase = await createClient();

  const [usersCount, teamsCount, tournamentsCount, reportsCount] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("teams")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("tournaments")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  return {
    totalUsers: usersCount.count || 0,
    totalTeams: teamsCount.count || 0,
    totalTournaments: tournamentsCount.count || 0,
    pendingReports: reportsCount.count || 0,
  };
}

export async function getReports(status?: string) {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("reports")
    .select(`
      *,
      reporter:reporter_id(username, display_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (status) {
    queryBuilder = queryBuilder.eq("status", status);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

export async function updateReportStatus(
  reportId: string,
  status: string,
  resolution?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updateData: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
  };

  if (user) updateData.reviewed_by = user.id;
  if (resolution) updateData.resolution = resolution;

  const { error } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", reportId);

  if (error) throw error;
  revalidatePath("/admin");
}

export async function createReport(data: {
  target_type: string;
  target_id: string;
  reason: string;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: data.target_type,
    target_id: data.target_id,
    reason: data.reason,
    description: data.description,
  });

  if (error) throw error;
}

export async function suspendUser(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "offline" })
    .eq("user_id", userId);

  if (error) throw error;

  await supabase.from("audit_logs").insert({
    action: "suspend_user",
    entity_type: "user",
    entity_id: userId,
  });

  revalidatePath("/admin");
}

export async function getAuditLogs(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      profiles:user_id(username, display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details || {},
  });
}

export async function getAllUsers(page = 1, limit = 20) {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("profiles")
    .select(`
      *,
      ratings(rating, global_rank)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { users: data, total: count || 0, page, limit };
}

export async function getAllTeams(page = 1, limit = 20) {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("teams")
    .select(`
      *,
      team_members(count),
      team_statistics(*)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { teams: data, total: count || 0, page, limit };
}

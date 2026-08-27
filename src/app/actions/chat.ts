"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getChannels(type?: "tournament" | "team", entityId?: string) {
  const supabase = await createClient();
  let queryBuilder = supabase.from("channels").select("*");

  if (type === "tournament" && entityId) {
    queryBuilder = queryBuilder.eq("tournament_id", entityId);
  } else if (type === "team" && entityId) {
    queryBuilder = queryBuilder.eq("team_id", entityId);
  } else {
    queryBuilder = queryBuilder.is("tournament_id", null).is("team_id", null);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

export async function getMessages(channelId: string, limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      profiles:user_id(username, display_name, avatar_url)
    `)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse();
}

export async function sendMessage(channelId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      channel_id: channelId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      profiles:user_id(username, display_name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
  return count || 0;
}

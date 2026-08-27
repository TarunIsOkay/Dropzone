"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createStrategy(data: {
  name: string;
  description?: string;
  map: string;
  team_id?: string;
  visibility?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: strategy, error } = await supabase
    .from("strategies")
    .insert({
      name: data.name,
      description: data.description,
      map: data.map,
      author_id: user.id,
      team_id: data.team_id,
      visibility: data.visibility || "private",
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("strategy_layers").insert([
    { strategy_id: strategy.id, name: "Player Positions", type: "markers", order: 0 },
    { strategy_id: strategy.id, name: "Enemy Positions", type: "markers", order: 1 },
    { strategy_id: strategy.id, name: "Routes", type: "routes", order: 2 },
    { strategy_id: strategy.id, name: "Zones", type: "zones", order: 3 },
  ]);

  revalidatePath("/strategies");
  return strategy;
}

export async function getStrategies(filters?: {
  author_id?: string;
  team_id?: string;
  map?: string;
  visibility?: string;
}) {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("strategies")
    .select(`
      *,
      profiles:author_id(username, display_name, avatar_url),
      teams:team_id(name, tag)
    `)
    .order("updated_at", { ascending: false });

  if (filters?.author_id) {
    queryBuilder = queryBuilder.eq("author_id", filters.author_id);
  }
  if (filters?.team_id) {
    queryBuilder = queryBuilder.eq("team_id", filters.team_id);
  }
  if (filters?.map) {
    queryBuilder = queryBuilder.eq("map", filters.map);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return data;
}

export async function getStrategyById(strategyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("strategies")
    .select(`
      *,
      profiles:author_id(username, display_name, avatar_url),
      teams:team_id(name, tag),
      strategy_layers(*, strategy_markers(*), strategy_routes(*)),
      timeline_events(*)
    `)
    .eq("id", strategyId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateStrategy(
  strategyId: string,
  updates: {
    name?: string;
    description?: string;
    visibility?: string;
  }
) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("strategies")
    .select("version")
    .eq("id", strategyId)
    .single();

  const { error } = await supabase
    .from("strategies")
    .update({
      ...updates,
      version: (existing?.version || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", strategyId);

  if (error) throw error;
  revalidatePath("/strategies");
}

export async function deleteStrategy(strategyId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("strategies")
    .delete()
    .eq("id", strategyId);

  if (error) throw error;
  revalidatePath("/strategies");
}

export async function duplicateStrategy(strategyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: original, error: fetchError } = await supabase
    .from("strategies")
    .select(`
      *,
      strategy_layers(
        *,
        strategy_markers(*),
        strategy_routes(*)
      ),
      timeline_events(*)
    `)
    .eq("id", strategyId)
    .single();

  if (fetchError || !original) throw fetchError;

  const { data: newStrategy, error: createError } = await supabase
    .from("strategies")
    .insert({
      name: `${original.name} (Copy)`,
      description: original.description,
      map: original.map,
      author_id: user.id,
      team_id: original.team_id,
      visibility: "private",
    })
    .select()
    .single();

  if (createError) throw createError;

  for (const layer of (original as { strategy_layers: Array<{ name: string; type: string; visible: boolean; locked: boolean; order: number; strategy_markers: Array<{ type: string; x: number; y: number; label: string | null; color: string; role: string | null; rotation: number; data: Record<string, unknown> }>; strategy_routes: Array<{ type: string; points: Array<{ x: number; y: number }>; color: string; label: string | null; animated: boolean }> }> }).strategy_layers) {
    const { data: newLayer } = await supabase
      .from("strategy_layers")
      .insert({
        strategy_id: newStrategy.id,
        name: layer.name,
        type: layer.type,
        visible: layer.visible,
        locked: layer.locked,
        order: layer.order,
      })
      .select()
      .single();

    if (newLayer) {
      for (const marker of layer.strategy_markers) {
        await supabase.from("strategy_markers").insert({
          layer_id: newLayer.id,
          strategy_id: newStrategy.id,
          type: marker.type,
          x: marker.x,
          y: marker.y,
          label: marker.label,
          color: marker.color,
          role: marker.role,
          rotation: marker.rotation,
          data: marker.data,
        });
      }
      for (const route of layer.strategy_routes) {
        await supabase.from("strategy_routes").insert({
          layer_id: newLayer.id,
          strategy_id: newStrategy.id,
          type: route.type,
          points: route.points,
          color: route.color,
          label: route.label,
          animated: route.animated,
        });
      }
    }
  }

  revalidatePath("/strategies");
  return newStrategy;
}

export async function saveMarkers(
  strategyId: string,
  markers: Array<{
    layer_id: string;
    type: string;
    x: number;
    y: number;
    label?: string;
    color?: string;
    role?: string;
  }>
) {
  const supabase = await createClient();

  await supabase
    .from("strategy_markers")
    .delete()
    .eq("strategy_id", strategyId);

  const { error } = await supabase.from("strategy_markers").insert(
    markers.map((m) => ({
      ...m,
      strategy_id: strategyId,
    }))
  );

  if (error) throw error;

  await supabase
    .from("strategies")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", strategyId);
}

export async function saveRoutes(
  strategyId: string,
  routes: Array<{
    layer_id: string;
    type: string;
    points: Array<{ x: number; y: number }>;
    color?: string;
    label?: string;
    animated?: boolean;
  }>
) {
  const supabase = await createClient();

  await supabase
    .from("strategy_routes")
    .delete()
    .eq("strategy_id", strategyId);

  const { error } = await supabase.from("strategy_routes").insert(
    routes.map((r) => ({
      ...r,
      strategy_id: strategyId,
    }))
  );

  if (error) throw error;

  await supabase
    .from("strategies")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", strategyId);
}

"use client";

import { useEffect, useState } from "react";
import { Search, Users, MapPin, Trophy, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createTeam } from "@/app/actions/teams";
import { createClient } from "@/lib/supabase/client";

interface TeamRow {
  id: string; name: string; tag: string; description: string | null; region: string | null;
  is_recruiting: boolean | null; team_members: { count: number }[];
  team_statistics: { wins: number; kd_ratio: number } | null;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", tag: "", description: "", region: "", country: "" });

  useEffect(() => {
    const supabase = createClient();
    const loadTeams = async () => {
      let query = supabase.from("teams").select("*, team_members(count), team_statistics(total_matches, wins, kd_ratio, win_rate)").order("created_at", { ascending: false }).limit(50);
      if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
      const { data } = await query;
      setTeams((data || []) as TeamRow[]);
      setLoading(false);
    };
    loadTeams();
  }, [searchQuery]);

  const handleCreate = async () => {
    setCreating(true);
    try { await createTeam(form); setShowCreate(false); setForm({ name: "", tag: "", description: "", region: "", country: "" }); } catch (err) { console.error(err); }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Teams</h1><p className="text-sm text-dz-text-muted mt-0.5">Find and join competitive teams</p></div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />Create Team</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-text-dim" />
        <input type="text" placeholder="Search teams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-dz-elevated border border-dz-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-dz-text placeholder:text-dz-text-dim focus:outline-none focus:ring-2 focus:ring-dz-crimson/50 focus:border-dz-crimson transition-colors" />
      </div>

      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Card key={i} className="p-0 overflow-hidden"><Skeleton className="h-16" /><div className="px-4 pb-4 space-y-3"><div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-xl" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div><Skeleton className="h-3 w-full" /></div></Card>)}</div> :
        teams.length === 0 ? <div className="text-center py-12"><Users className="w-16 h-16 text-dz-text-dim mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">No Teams Found</h2><p className="text-dz-text-muted mb-4">Be the first to create a team</p><Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />Create Team</Button></div> :
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} hover className="p-0 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-dz-crimson/10 to-transparent" />
              <div className="px-4 pb-4 -mt-6">
                <div className="flex items-end gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-dz-elevated border border-dz-border flex items-center justify-center font-bold text-sm text-dz-crimson-400">{team.tag}</div>
                  <div className="flex-1"><h3 className="font-semibold">{team.name}</h3><div className="flex items-center gap-2 text-xs text-dz-text-muted"><MapPin className="w-3 h-3" />{(team.region || "Global").toUpperCase()}</div></div>
                  {team.is_recruiting ? <Badge variant="green" size="sm">Recruiting</Badge> : null}
                </div>
                {team.description ? <p className="text-xs text-dz-text-muted mb-3 line-clamp-2">{team.description}</p> : null}
                <div className="flex items-center justify-between text-xs text-dz-text-dim border-t border-dz-border pt-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{team.team_members?.[0]?.count || 0} members</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{team.team_statistics?.wins || 0} wins</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Team" size="lg">
        <div className="space-y-4">
          <Input label="Team Name" placeholder="Team name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Tag (2-5 chars)" placeholder="TG" maxLength={5} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          <Input label="Description" placeholder="Team description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} options={[{ value: "", label: "Select region" }, { value: "asia", label: "Asia" }, { value: "eu", label: "Europe" }, { value: "na", label: "North America" }, { value: "sa", label: "South America" }, { value: "me", label: "Middle East" }, { value: "oce", label: "Oceania" }, { value: "africa", label: "Africa" }]} />
            <Input label="Country" placeholder="India" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={creating} disabled={!form.name || !form.tag}>Create Team</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

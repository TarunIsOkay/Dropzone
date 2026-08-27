"use client";

import { useEffect, useState } from "react";
import { Trophy, Calendar, Users, MapPin, Plus, Swords, ChevronRight, Zap, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { createTournament } from "@/app/actions/tournaments";
import { createClient } from "@/lib/supabase/client";

interface TournamentRow {
  id: string; name: string; description: string | null; format: string; region: string | null;
  status: string; max_teams: number; prize_pool: string | null; starts_at: string | null;
  tournament_registrations: { count: number }[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "green" | "amber" | "crimson" | "cyan" }> = {
  draft: { label: "Draft", variant: "default" },
  registration: { label: "Open", variant: "green" },
  "check-in": { label: "Check-in", variant: "amber" },
  live: { label: "Live", variant: "crimson" },
  results: { label: "Results", variant: "cyan" },
  completed: { label: "Completed", variant: "default" },
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", game: "free-fire", format: "br-squad", max_teams: "32", min_team_size: "4", max_team_size: "4", prize_pool: "", entry_fee: "", starts_at: "", registration_closes: "", rules: "" });

  useEffect(() => {
    const supabase = createClient();
    const loadTournaments = async () => {
      let query = supabase.from("tournaments").select("*, tournament_registrations(count)").order("starts_at", { ascending: true });
      if (filter !== "all") query = query.eq("status", filter);
      const { data } = await query;
      setTournaments((data || []) as TournamentRow[]);
      setLoading(false);
    };
    loadTournaments();
  }, [filter]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createTournament({ name: form.name, description: form.description, game: form.game, format: form.format, max_teams: parseInt(form.max_teams), min_team_size: parseInt(form.min_team_size), max_team_size: parseInt(form.max_team_size), prize_pool: form.prize_pool || undefined, entry_fee: form.entry_fee || undefined, starts_at: form.starts_at, registration_closes: form.registration_closes, rules: form.rules || undefined });
      setShowCreate(false);
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Tournaments</h1><p className="text-sm text-dz-text-muted mt-0.5">Compete and climb the rankings</p></div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />Create Tournament</Button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {["all", "registration", "check-in", "live", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-dz-crimson/10 text-dz-crimson-400 border border-dz-crimson/20" : "text-dz-text-muted hover:text-dz-text hover:bg-dz-elevated border border-transparent"}`}>
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Card key={i} className="flex items-center gap-4"><Skeleton className="w-12 h-12 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div></Card>)}</div> :
        tournaments.length === 0 ? <div className="text-center py-12"><Trophy className="w-16 h-16 text-dz-text-dim mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">No Tournaments</h2><p className="text-dz-text-muted mb-4">Create the first tournament</p><Button variant="primary" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" />Create Tournament</Button></div> :
        <div className="space-y-3">
          {tournaments.map((t) => {
            const status = statusConfig[t.status] || statusConfig.draft;
            return (
              <Card key={t.id} hover className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-dz-crimson/10 border border-dz-crimson/20 flex items-center justify-center shrink-0"><Trophy className="w-6 h-6 text-dz-crimson-400" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5"><h3 className="font-semibold truncate">{t.name}</h3><Badge variant={status.variant} size="sm" dot={t.status === "live"}>{status.label}</Badge></div>
                  {t.description ? <p className="text-xs text-dz-text-muted mb-1 line-clamp-1">{t.description}</p> : null}
                  <div className="flex items-center flex-wrap gap-3 text-xs text-dz-text-dim">
                    <span className="flex items-center gap-1"><Swords className="w-3 h-3" />{t.format}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.max_teams} max</span>
                    {t.region ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.region.toUpperCase()}</span> : null}
                    {t.starts_at ? <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(t.starts_at).toLocaleDateString()}</span> : null}
                    {t.prize_pool ? <span className="text-dz-cyan-400 font-medium">{t.prize_pool}</span> : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.status === "registration" ? <Button variant="primary" size="sm">Register<ChevronRight className="w-4 h-4" /></Button> : null}
                  {t.status === "check-in" ? <Button variant="secondary" size="sm">Check In</Button> : null}
                  {t.status === "live" ? <Button variant="secondary" size="sm"><Zap className="w-4 h-4" />Watch</Button> : null}
                </div>
              </Card>
            );
          })}
        </div>
      }

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Tournament" size="xl">
        <div className="space-y-4">
          <Input label="Tournament Name" placeholder="Weekend Cup" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" placeholder="Tournament description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Game" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} options={[{ value: "free-fire", label: "Free Fire" }]} />
            <Select label="Format" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} options={[{ value: "br-squad", label: "BR Squad" }, { value: "br-duo", label: "BR Duo" }, { value: "br-solo", label: "BR Solo" }]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Max Teams" type="number" value={form.max_teams} onChange={(e) => setForm({ ...form, max_teams: e.target.value })} />
            <Input label="Min Size" type="number" value={form.min_team_size} onChange={(e) => setForm({ ...form, min_team_size: e.target.value })} />
            <Input label="Max Size" type="number" value={form.max_team_size} onChange={(e) => setForm({ ...form, max_team_size: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prize Pool" placeholder="$500" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} />
            <Input label="Entry Fee" placeholder="Free" value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: e.target.value })} />
          </div>
          <Input label="Start Date" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          <Input label="Registration Closes" type="datetime-local" value={form.registration_closes} onChange={(e) => setForm({ ...form, registration_closes: e.target.value })} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={creating} disabled={!form.name || !form.starts_at}>Create Tournament</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

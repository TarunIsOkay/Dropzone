"use client";

import { useState, useEffect } from "react";
import { Search, Users, Trophy, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "players", label: "Players", icon: Users },
  { id: "teams", label: "Teams", icon: Users },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "strategies", label: "Strategies", icon: Map },
];

interface PlayerRow { id: string; username: string; display_name: string; looking_for_team: boolean | null; primary_role: string | null; region: string | null; ratings: { rating: number } | null }
interface TeamRow { id: string; name: string; tag: string; region: string | null; is_recruiting: boolean | null }
interface TournamentRow { id: string; name: string; format: string; status: string }
interface StrategyRow { id: string; name: string; map: string; version: number; profiles: { display_name: string } | null }

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState("players");
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setPlayers([]); setTeams([]); setTournaments([]); setStrategies([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      try {
        if (activeTab === "players") {
          const { data } = await supabase.from("profiles").select("*, ratings(rating)").ilike("username", `%${query}%`).limit(20);
          setPlayers((data || []) as PlayerRow[]);
        } else if (activeTab === "teams") {
          const { data } = await supabase.from("teams").select("*, team_members(count), team_statistics(*)").ilike("name", `%${query}%`).limit(20);
          setTeams((data || []) as TeamRow[]);
        } else if (activeTab === "tournaments") {
          const { data } = await supabase.from("tournaments").select("*").ilike("name", `%${query}%`).limit(20);
          setTournaments((data || []) as TournamentRow[]);
        } else {
          const { data } = await supabase.from("strategies").select("*, profiles:author_id(username, display_name)").ilike("name", `%${query}%`).eq("visibility", "public").limit(20);
          setStrategies((data || []) as StrategyRow[]);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Search & Discovery</h1><p className="text-sm text-dz-text-muted mt-0.5">Find players, teams, tournaments, and strategies</p></div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dz-text-dim" />
        <input type="text" placeholder="Search everything..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-dz-elevated border border-dz-border rounded-xl pl-12 pr-4 py-3 text-dz-text placeholder:text-dz-text-dim focus:outline-none focus:ring-2 focus:ring-dz-crimson/50 focus:border-dz-crimson transition-colors" />
      </div>
      <div className="flex items-center gap-1 border-b border-dz-border pb-px">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px", activeTab === tab.id ? "text-dz-crimson-400 border-dz-crimson" : "text-dz-text-muted border-transparent hover:text-dz-text")}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Card key={i} className="flex items-center gap-4"><Skeleton className="w-10 h-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /></div></Card>)}</div> :
        !query.trim() ? <div className="text-center py-12"><Search className="w-16 h-16 text-dz-text-dim mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Search DropZone</h2><p className="text-dz-text-muted">Search for players, teams, tournaments, or strategies</p></div> :
        activeTab === "players" && players.length === 0 && teams.length === 0 && tournaments.length === 0 && strategies.length === 0 ? <p className="text-dz-text-muted text-center py-12">No results for &quot;{query}&quot;</p> : null
      }

      {!loading && activeTab === "players" && players.map((p) => (
        <Card key={p.id} hover className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-dz-elevated flex items-center justify-center text-sm font-medium">{(p.display_name || "U").charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2"><span className="font-medium">{p.display_name}</span>{p.looking_for_team ? <Badge variant="cyan" size="sm">LFT</Badge> : null}</div>
            <div className="flex items-center gap-2 text-xs text-dz-text-dim"><span className="font-mono">{p.username}</span>{p.primary_role ? <span>{p.primary_role}</span> : null}{p.region ? <span>{p.region.toUpperCase()}</span> : null}</div>
          </div>
          <div className="text-right"><p className="text-sm font-bold font-mono text-dz-cyan-400">{p.ratings?.rating ? Number(p.ratings.rating).toLocaleString() : "1,000"}</p><p className="text-[10px] text-dz-text-dim">rating</p></div>
        </Card>
      ))}

      {!loading && activeTab === "teams" && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{teams.map((t) => (
        <Card key={t.id} hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-dz-crimson/10 border border-dz-crimson/20 flex items-center justify-center font-bold text-sm text-dz-crimson-400">{t.tag}</div>
            <div className="flex-1 min-w-0"><h3 className="font-semibold text-sm truncate">{t.name}</h3><p className="text-xs text-dz-text-dim">{(t.region || "Global").toUpperCase()}</p></div>
            {t.is_recruiting ? <Badge variant="green" size="sm">Recruiting</Badge> : null}
          </div>
        </Card>
      ))}</div>}

      {!loading && activeTab === "tournaments" && tournaments.map((t) => (
        <Card key={t.id} hover className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-dz-amber/10 flex items-center justify-center"><Trophy className="w-5 h-5 text-dz-amber-400" /></div>
          <div className="flex-1"><h3 className="font-medium text-sm">{t.name}</h3><p className="text-xs text-dz-text-dim">{t.format}</p></div>
          <Badge variant={t.status === "live" ? "crimson" : t.status === "registration" ? "green" : "default"} size="sm" dot={t.status === "live"}>{t.status}</Badge>
        </Card>
      ))}

      {!loading && activeTab === "strategies" && strategies.map((s) => (
        <Card key={s.id} hover className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-dz-cyan/10 flex items-center justify-center"><Map className="w-5 h-5 text-dz-cyan-400" /></div>
          <div className="flex-1"><h3 className="font-medium text-sm">{s.name}</h3><p className="text-xs text-dz-text-dim">by {s.profiles?.display_name || "Unknown"} • {s.map}</p></div>
          <Badge variant="cyan" size="sm">v{s.version}</Badge>
        </Card>
      ))}
    </div>
  );
}

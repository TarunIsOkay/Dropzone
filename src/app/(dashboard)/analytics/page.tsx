"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Target, Trophy, Swords, Award } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const demoRatingHistory = [
  { date: "Mon", rating: 1000 }, { date: "Tue", rating: 1023 }, { date: "Wed", rating: 1045 },
  { date: "Thu", rating: 1032 }, { date: "Fri", rating: 1067 }, { date: "Sat", rating: 1089 }, { date: "Sun", rating: 1078 },
];
const demoMatchHistory = [
  { match: 1, placement: 3, eliminations: 8 }, { match: 2, placement: 1, eliminations: 12 },
  { match: 3, placement: 5, eliminations: 6 }, { match: 4, placement: 2, eliminations: 10 },
  { match: 5, placement: 1, eliminations: 15 }, { match: 6, placement: 4, eliminations: 7 },
];
const demoMapStats = [
  { name: "Bermuda", wins: 23, matches: 45 }, { name: "Kalahari", wins: 18, matches: 38 },
  { name: "Purgatory", wins: 12, matches: 30 }, { name: "Alpine", wins: 8, matches: 20 },
];
const demoPerformance = [{ phase: "Early", score: 72 }, { phase: "Mid", score: 85 }, { phase: "Late", score: 68 }];
const COLORS = ["#dc2626", "#06b6d4", "#22c55e", "#f59e0b", "#a855f7"];

interface LbEntry { user_id: string; rating: number; global_rank: number | null; profiles: { display_name: string; region: string; primary_role: string } | null }

export default function AnalyticsPage() {
  const [totalMatches, setTotalMatches] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [kd, setKd] = useState(0);
  const [rating, setRating] = useState(1000);
  const [leaderboard, setLeaderboard] = useState<LbEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [s, r, lb] = await Promise.all([
        supabase.from("player_statistics").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("ratings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("ratings").select("*, profiles:user_id(username, display_name, avatar_url, region, primary_role)").order("rating", { ascending: false }).limit(20),
      ]);
      setTotalMatches(Number(s.data?.total_matches) || 0);
      setWinRate(Number(s.data?.win_rate) || 0);
      setKd(Number(s.data?.kd_ratio) || 0);
      setRating(Number(r.data?.rating) || 1000);
      setLeaderboard((lb.data || []) as LbEntry[]);
      setLoading(false);
    };
    loadData();
  }, []);

  const statCards = [
    { label: "Total Matches", value: String(totalMatches), icon: Swords, color: "crimson" },
    { label: "Win Rate", value: `${(winRate * 100).toFixed(1)}%`, icon: Trophy, color: "amber" },
    { label: "K/D Ratio", value: kd.toFixed(2), icon: Target, color: "cyan" },
    { label: "Rating", value: rating.toLocaleString(), icon: TrendingUp, color: "green" },
  ];
  const colorMap: Record<string, string> = { crimson: "bg-dz-crimson/10", cyan: "bg-dz-cyan/10", amber: "bg-dz-amber/10", green: "bg-dz-green/10" };
  const iconMap: Record<string, string> = { crimson: "text-dz-crimson-400", cyan: "text-dz-cyan-400", amber: "text-dz-amber-400", green: "text-dz-green-400" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-sm text-dz-text-muted mt-0.5">Performance insights and rankings</p></div>
        <Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} options={[{ value: "all", label: "All Regions" }, { value: "asia", label: "Asia" }, { value: "eu", label: "Europe" }, { value: "na", label: "North America" }]} className="w-40" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs text-dz-text-muted uppercase tracking-wider font-medium">{stat.label}</p><p className="text-2xl font-bold mt-1">{stat.value}</p></div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}><stat.icon className={`w-5 h-5 ${iconMap[stat.color]}`} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Rating History</CardTitle></CardHeader>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoRatingHistory}>
                <defs><linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" /><XAxis dataKey="date" stroke="#5a5a72" fontSize={11} /><YAxis stroke="#5a5a72" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="rating" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorRating)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Matches</CardTitle></CardHeader>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoMatchHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" /><XAxis dataKey="match" stroke="#5a5a72" fontSize={11} /><YAxis stroke="#5a5a72" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="eliminations" fill="#dc2626" radius={[4, 4, 0, 0]} /><Bar dataKey="placement" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Map Performance</CardTitle></CardHeader>
          <div className="mt-3 space-y-3">
            {demoMapStats.map((map, i) => (
              <div key={map.name}>
                <div className="flex items-center justify-between text-xs mb-1"><span className="text-dz-text-muted">{map.name}</span><span className="text-dz-text">{map.wins}/{map.matches} ({((map.wins / map.matches) * 100).toFixed(0)}%)</span></div>
                <div className="h-2 bg-dz-elevated rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(map.wins / map.matches) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Phase Performance</CardTitle></CardHeader>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={demoPerformance} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="score">{demoPerformance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">{demoPerformance.map((p, i) => <div key={p.phase} className="flex items-center gap-1.5 text-xs"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} /><span className="text-dz-text-muted">{p.phase}</span><span className="font-medium">{p.score}</span></div>)}</div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle><div className="flex items-center gap-2"><Award className="w-4 h-4 text-dz-amber-400" />Leaderboard</div></CardTitle></CardHeader>
        <div className="mt-3">
          <div className="grid grid-cols-[40px_1fr_100px_80px_80px] gap-2 text-xs text-dz-text-dim uppercase tracking-wider px-3 py-2 border-b border-dz-border"><span>#</span><span>Player</span><span>Role</span><span>Rating</span><span>Rank</span></div>
          {leaderboard.length === 0 ? <div className="text-center py-8 text-sm text-dz-text-muted">No rankings yet</div> :
            leaderboard.map((entry, i) => (
              <div key={entry.user_id} className="grid grid-cols-[40px_1fr_100px_80px_80px] gap-2 items-center px-3 py-2.5 border-b border-dz-border/50 hover:bg-dz-elevated transition-colors">
                <span className={`font-bold ${i === 0 ? "text-dz-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-dz-text-dim"}`}>{i + 1}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-dz-elevated flex items-center justify-center text-xs font-medium shrink-0">{(entry.profiles?.display_name || "U").charAt(0)}</div>
                  <div className="min-w-0"><p className="text-sm font-medium truncate">{entry.profiles?.display_name || "Unknown"}</p><p className="text-[10px] text-dz-text-dim">{entry.profiles?.region || ""}</p></div>
                </div>
                <span className="text-xs text-dz-text-muted">{entry.profiles?.primary_role || "-"}</span>
                <span className="text-sm font-bold font-mono text-dz-cyan-400">{Number(entry.rating).toLocaleString()}</span>
                <span className="text-xs text-dz-text-dim">#{entry.global_rank || "-"}</span>
              </div>
            ))
          }
        </div>
      </Card>
    </div>
  );
}

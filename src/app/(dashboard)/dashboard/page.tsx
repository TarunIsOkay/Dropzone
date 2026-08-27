"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy, Users, Swords, Map, TrendingUp, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface Match { id: string; round_number: number; map: string; tournament: { name: string } | null }
interface Tournament { id: string; name: string; status: string; max_teams: number; prize_pool: string | null; starts_at: string | null }
interface UserRow { username: string; display_name: string; avatar_url: string | null }
interface Stat { label: string; value: string; change: string; icon: typeof TrendingUp; color: string }

export default function DashboardPage() {
  const [rating, setRating] = useState<number>(1000);
  const [rank, setRank] = useState<number>(0);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activity, setActivity] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const loadData = async () => {
      const [ratingRes, liveRes, tourRes, activityRes] = await Promise.all([
        supabase.from("ratings").select("rating, global_rank").maybeSingle(),
        supabase.from("matches").select("*, tournament:tournaments(name)").eq("status", "live").limit(5),
        supabase.from("tournaments").select("*").in("status", ["registration", "check-in", "live"]).order("starts_at", { ascending: true }).limit(5),
        supabase.from("profiles").select("username, display_name, avatar_url").order("updated_at", { ascending: false }).limit(5),
      ]);
      setRating(Number(ratingRes.data?.rating) || 1000);
      setRank(Number(ratingRes.data?.global_rank) || 0);
      setLiveMatches((liveRes.data || []) as Match[]);
      setTournaments((tourRes.data || []) as Tournament[]);
      setActivity((activityRes.data || []) as UserRow[]);
      setLoading(false);
    };
    loadData();
  }, []);

  const quickStats: Stat[] = [
    { label: "Your Rating", value: rating.toLocaleString(), change: rank ? `Rank #${rank}` : "Unranked", icon: TrendingUp, color: "crimson" },
    { label: "Live Matches", value: String(liveMatches.length), change: `${liveMatches.length} active`, icon: Swords, color: "cyan" },
    { label: "Tournaments", value: String(tournaments.length), change: "Browse all", icon: Trophy, color: "amber" },
    { label: "Community", value: "DropZone", change: "v0.1.0", icon: Users, color: "green" },
  ];

  const colorMap: Record<string, string> = {
    crimson: "bg-dz-crimson/10",
    cyan: "bg-dz-cyan/10",
    amber: "bg-dz-amber/10",
    green: "bg-dz-green/10",
  };
  const iconColorMap: Record<string, string> = {
    crimson: "text-dz-crimson-400",
    cyan: "text-dz-cyan-400",
    amber: "text-dz-amber-400",
    green: "text-dz-green-400",
  };
  const textColorMap: Record<string, string> = {
    crimson: "text-dz-crimson-400",
    cyan: "text-dz-cyan-400",
    amber: "text-dz-amber-400",
    green: "text-dz-green-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-dz-text-muted mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tournaments"><Button variant="secondary" size="sm"><Trophy className="w-4 h-4" />Tournaments</Button></Link>
          <Link href="/strategies"><Button variant="primary" size="sm"><Map className="w-4 h-4" />Map Studio</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-dz-text-muted uppercase tracking-wider font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${textColorMap[stat.color]}`}>{stat.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                <stat.icon className={`w-5 h-5 ${iconColorMap[stat.color]}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-dz-crimson animate-pulse" />Live Matches</div></CardTitle>
            </CardHeader>
            <div className="mt-3 space-y-2">
              {loading ? Array.from({ length: 3 }).map((_, i) => (<div key={i} className="flex items-center gap-4 p-3"><Skeleton className="w-10 h-10 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>)) :
                liveMatches.length === 0 ? (
                  <div className="text-center py-8"><Swords className="w-12 h-12 text-dz-text-dim mx-auto mb-3" /><p className="text-sm text-dz-text-muted">No live matches right now</p></div>
                ) : liveMatches.map((match) => (
                  <div key={match.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-dz-elevated transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-dz-crimson/10 flex items-center justify-center shrink-0"><Swords className="w-5 h-5 text-dz-crimson-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{match.tournament?.name || "Match"}</p>
                      <p className="text-xs text-dz-text-muted">Round {match.round_number} • {match.map}</p>
                    </div>
                    <Badge variant="crimson" size="sm" dot>LIVE</Badge>
                  </div>
                ))
              }
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Community</CardTitle></CardHeader>
          <div className="mt-3 space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-3 w-1/2" /></div></div>)) :
              activity.length === 0 ? <p className="text-sm text-dz-text-muted text-center py-4">No recent activity</p> :
              activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Avatar name={a.display_name || a.username || "User"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm"><span className="font-medium">{a.display_name || a.username}</span></p>
                    <p className="text-[11px] text-dz-text-dim">Active recently</p>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tournaments</CardTitle>
          <Link href="/tournaments" className="text-xs text-dz-crimson-400 hover:text-dz-crimson-300">View all</Link>
        </CardHeader>
        <div className="mt-3">
          {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-3 rounded-lg border border-dz-border space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>)}</div> :
            tournaments.length === 0 ? <p className="text-sm text-dz-text-muted text-center py-6">No active tournaments</p> :
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tournaments.map((t) => (
                <div key={t.id} className="p-3 rounded-lg border border-dz-border hover:border-dz-border-light hover:bg-dz-elevated transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold truncate">{t.name}</h3>
                    <Badge variant={t.status === "live" ? "crimson" : t.status === "check-in" ? "amber" : "green"} size="sm" dot={t.status === "live"}>{t.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-dz-text-muted">
                    <span>{t.max_teams} max teams</span>
                    {t.prize_pool ? <span className="text-dz-cyan-400 font-medium">{t.prize_pool}</span> : null}
                  </div>
                  {t.starts_at ? (
                    <div className="flex items-center gap-1 mt-2 text-xs text-dz-text-dim"><Clock className="w-3 h-3" />{new Date(t.starts_at).toLocaleDateString()}</div>
                  ) : null}
                </div>
              ))}
            </div>
          }
        </div>
      </Card>
    </div>
  );
}

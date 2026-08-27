"use client";

import { useEffect, useState } from "react";
import { MapPin, Gamepad2, Edit3, Users } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/actions/profiles";

interface ProfileData {
  user_id: string; username: string; display_name: string; avatar_url: string | null; bio: string | null;
  region: string | null; country: string | null; ign: string | null; game_uid: string | null;
  primary_role: string | null; looking_for_team: boolean | null; discord_username: string | null;
}
interface StatsData { total_matches: number; wins: number; booyahs: number; kd_ratio: number; average_placement: number }
interface RatingData { rating: number; global_rank: number | null }

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ display_name: "", bio: "", region: "", country: "", ign: "", game_uid: "", primary_role: "", experience: "", discord_username: "" });

  useEffect(() => {
    const supabase = createClient();
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [p, s, r] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("player_statistics").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("ratings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setProfile(p.data as ProfileData);
      setStats(s.data as StatsData);
      setRating(r.data as RatingData);
      if (p.data) {
        const d = p.data as Record<string, unknown>;
        setForm({
          display_name: String(d.display_name || ""), bio: String(d.bio || ""), region: String(d.region || ""),
          country: String(d.country || ""), ign: String(d.ign || ""), game_uid: String(d.game_uid || ""),
          primary_role: String(d.primary_role || ""), experience: String(d.experience || ""),
          discord_username: String(d.discord_username || ""),
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateProfile(profile.user_id, form);
      setProfile(updated as ProfileData);
      setEditing(false);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) return <div className="space-y-6"><Card padding="none" className="overflow-hidden"><Skeleton className="h-32" /><div className="px-6 pb-6"><div className="flex items-end gap-4 -mt-10"><Skeleton className="w-20 h-20 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div></div></div></Card></div>;
  if (!profile) return <div className="text-center py-20"><Users className="w-16 h-16 text-dz-text-dim mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">No Profile Found</h2><p className="text-dz-text-muted">Sign up to create your profile</p></div>;

  return (
    <div className="space-y-6">
      <Card padding="none" className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-dz-crimson/20 to-dz-cyan/10 relative"><div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" /></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 relative">
            <Avatar name={profile.display_name} size="xl" status="online" className="ring-4 ring-dz-surface" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.display_name}</h1>
                {profile.looking_for_team ? <Badge variant="cyan" size="sm">Looking for Team</Badge> : null}
              </div>
              <p className="text-sm text-dz-text-muted">@{profile.username}</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-dz-text-dim">
                {profile.region ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.country}, {profile.region.toUpperCase()}</span> : null}
                {profile.primary_role ? <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{profile.primary_role}</span> : null}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}><Edit3 className="w-4 h-4" />Edit Profile</Button>
          </div>
          {profile.bio ? <p className="text-sm text-dz-text-muted mt-4 max-w-2xl">{profile.bio}</p> : null}
          <div className="flex items-center flex-wrap gap-3 mt-4">
            {profile.discord_username ? <span className="text-xs text-dz-text-dim flex items-center gap-1"><div className="w-4 h-4 rounded bg-[#5865F2]/20 flex items-center justify-center"><span className="text-[8px] text-[#5865F2] font-bold">D</span></div>{profile.discord_username}</span> : null}
            {profile.ign ? <span className="text-xs text-dz-text-dim">IGN: <span className="text-dz-text font-mono">{profile.ign}</span></span> : null}
            {profile.game_uid ? <span className="text-xs text-dz-text-dim">UID: <span className="text-dz-text font-mono">{profile.game_uid}</span></span> : null}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-3">
              {[
                { label: "Matches", value: String(stats?.total_matches || 0) },
                { label: "Wins", value: String(stats?.wins || 0) },
                { label: "Booyahs", value: String(stats?.booyahs || 0) },
                { label: "K/D", value: stats?.kd_ratio ? Number(stats.kd_ratio).toFixed(1) : "0.0" },
                { label: "Avg Place", value: stats?.average_placement ? `#${Number(stats.average_placement).toFixed(1)}` : "#" },
                { label: "Rating", value: rating?.rating ? Number(rating.rating).toLocaleString() : "1,000" },
              ].map((s) => (
                <div key={s.label} className="text-center"><p className="text-xl font-bold">{s.value}</p><p className="text-[11px] text-dz-text-muted uppercase tracking-wider mt-0.5">{s.label}</p></div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Rating</CardTitle></CardHeader>
            <div className="mt-3 text-center">
              <div className="text-4xl font-black text-gradient">{rating?.rating ? Number(rating.rating).toLocaleString() : "1,000"}</div>
              <p className="text-xs text-dz-text-muted mt-1">{rating?.global_rank ? `Global Rank #${rating.global_rank}` : "Unranked"}</p>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Profile" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Display Name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            <Input label="Username" value={profile.username} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="IGN" value={form.ign} onChange={(e) => setForm({ ...form, ign: e.target.value })} />
            <Input label="Game UID" value={form.game_uid} onChange={(e) => setForm({ ...form, game_uid: e.target.value })} />
          </div>
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} options={[{ value: "", label: "Select region" }, { value: "asia", label: "Asia" }, { value: "eu", label: "Europe" }, { value: "na", label: "North America" }, { value: "sa", label: "South America" }, { value: "me", label: "Middle East" }, { value: "oce", label: "Oceania" }, { value: "africa", label: "Africa" }]} />
            <Select label="Primary Role" value={form.primary_role} onChange={(e) => setForm({ ...form, primary_role: e.target.value })} options={[{ value: "", label: "Select role" }, { value: "igl", label: "IGL" }, { value: "rusher", label: "Rusher" }, { value: "support", label: "Support" }, { value: "sniper", label: "Sniper" }, { value: "flanker", label: "Flanker" }, { value: "all-rounder", label: "All-Rounder" }]} />
          </div>
          <Input label="Discord Username" value={form.discord_username} onChange={(e) => setForm({ ...form, discord_username: e.target.value })} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

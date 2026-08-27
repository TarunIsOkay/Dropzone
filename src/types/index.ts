export type UserRole = "user" | "admin" | "moderator";

export type Region = "asia" | "eu" | "na" | "sa" | "me" | "oce" | "africa";

export type GameRole =
  | "igl"
  | "rusher"
  | "support"
  | "sniper"
  | "flanker"
  | "all-rounder";

export type TeamRole = "owner" | "captain" | "member" | "substitute";

export type PlayerStatus = "online" | "offline" | "in-match" | "looking-for-team";

export type TournamentStatus =
  | "draft"
  | "registration"
  | "check-in"
  | "live"
  | "results"
  | "completed";

export type MatchStatus =
  | "upcoming"
  | "check-in"
  | "room-ready"
  | "live"
  | "result-submission"
  | "under-review"
  | "completed"
  | "disputed";

export type StrategyVisibility = "private" | "team" | "shared" | "public";

export type ReportReason =
  | "cheating"
  | "toxicity"
  | "griefing"
  | "impersonation"
  | "inappropriate-content"
  | "other";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  region: Region | null;
  country: string | null;
  ign: string | null;
  game_uid: string | null;
  primary_role: GameRole | null;
  experience: string | null;
  status: PlayerStatus;
  looking_for_team: boolean;
  discord_username: string | null;
  youtube_url: string | null;
  twitch_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  region: Region | null;
  country: string | null;
  founded_at: string;
  is_recruiting: boolean;
  discord_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  game: string;
  format: string;
  region: Region | null;
  status: TournamentStatus;
  max_teams: number;
  min_team_size: number;
  max_team_size: number;
  prize_pool: string | null;
  entry_fee: string | null;
  registration_opens: string;
  registration_closes: string;
  check_in_opens: string;
  starts_at: string;
  ends_at: string | null;
  rules: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  team1_id: string | null;
  team2_id: string | null;
  team3_id: string | null;
  team4_id: string | null;
  scheduled_at: string | null;
  map: string | null;
  status: MatchStatus;
  room_id: string | null;
  room_password: string | null;
  room_expires_at: string | null;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerStatistics {
  user_id: string;
  total_matches: number;
  wins: number;
  booyahs: number;
  total_eliminations: number;
  total_damage: number;
  average_placement: number;
  kd_ratio: number;
  win_rate: number;
  booyah_rate: number;
  headshot_rate: number;
  updated_at: string;
}

export interface TeamStatistics {
  team_id: string;
  total_matches: number;
  wins: number;
  booyahs: number;
  total_eliminations: number;
  average_placement: number;
  kd_ratio: number;
  win_rate: number;
  booyah_rate: number;
  updated_at: string;
}

export interface Rating {
  user_id: string;
  rating: number;
  global_rank: number | null;
  regional_rank: number | null;
  country_rank: number | null;
  updated_at: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string | null;
  map: string;
  author_id: string;
  team_id: string | null;
  visibility: StrategyVisibility;
  version: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StrategyLayer {
  id: string;
  strategy_id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

export interface StrategyMarker {
  id: string;
  layer_id: string;
  strategy_id: string;
  type: string;
  x: number;
  y: number;
  label: string | null;
  color: string;
  role: GameRole | null;
  rotation: number;
  data: Record<string, unknown>;
}

export interface StrategyRoute {
  id: string;
  layer_id: string;
  strategy_id: string;
  type: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  label: string | null;
  animated: boolean;
}

export interface TimelineEvent {
  id: string;
  strategy_id: string;
  phase: string;
  label: string;
  time_seconds: number;
  duration_seconds: number;
  data: Record<string, unknown>;
  order: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: "user" | "team" | "message" | "tournament" | "strategy";
  target_id: string;
  reason: ReportReason;
  description: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

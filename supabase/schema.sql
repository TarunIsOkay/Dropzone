-- ============================================
-- DROPZONE - Database Schema
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

create type user_role as enum ('user', 'admin', 'moderator');
create type region as enum ('asia', 'eu', 'na', 'sa', 'me', 'oce', 'africa');
create type game_role as enum ('igl', 'rusher', 'support', 'sniper', 'flanker', 'all-rounder');
create type team_role as enum ('owner', 'captain', 'member', 'substitute');
create type player_status as enum ('online', 'offline', 'in-match', 'looking-for-team');
create type tournament_status as enum ('draft', 'registration', 'check-in', 'live', 'results', 'completed');
create type match_status as enum ('upcoming', 'check-in', 'room-ready', 'live', 'result-submission', 'under-review', 'completed', 'disputed');
create type strategy_visibility as enum ('private', 'team', 'shared', 'public');
create type report_target_type as enum ('user', 'team', 'message', 'tournament', 'strategy');
create type report_status as enum ('pending', 'reviewed', 'resolved', 'dismissed');
create type report_reason as enum ('cheating', 'toxicity', 'griefing', 'impersonation', 'inappropriate-content', 'other');

-- ============================================
-- TABLES
-- ============================================

-- Profiles
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  region region,
  country text,
  ign text,
  game_uid text,
  primary_role game_role,
  experience text,
  status player_status default 'offline',
  looking_for_team boolean default false,
  discord_username text,
  youtube_url text,
  twitch_url text,
  twitter_url text,
  instagram_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Teams
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tag text not null,
  logo_url text,
  banner_url text,
  description text,
  region region,
  country text,
  founded_at timestamptz default now(),
  is_recruiting boolean default false,
  discord_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team Members
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role team_role default 'member',
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);

-- Tournaments
create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  game text not null default 'free-fire',
  format text not null default 'battle-royale',
  region region,
  status tournament_status default 'draft',
  max_teams integer not null default 50,
  min_team_size integer not null default 4,
  max_team_size integer not null default 4,
  prize_pool text,
  entry_fee text,
  registration_opens timestamptz,
  registration_closes timestamptz,
  check_in_opens timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  rules text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tournament Registrations
create table tournament_registrations (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  status text default 'pending',
  registered_at timestamptz default now(),
  unique(tournament_id, team_id)
);

-- Rounds
create table rounds (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  round_number integer not null,
  name text,
  status tournament_status default 'draft',
  starts_at timestamptz,
  created_at timestamptz default now()
);

-- Matches
create table matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  round_id uuid references rounds(id) on delete set null,
  round_number integer not null default 1,
  match_number integer not null default 1,
  team1_id uuid references teams(id) on delete set null,
  team2_id uuid references teams(id) on delete set null,
  team3_id uuid references teams(id) on delete set null,
  team4_id uuid references teams(id) on delete set null,
  scheduled_at timestamptz,
  map text,
  status match_status default 'upcoming',
  room_id text,
  room_password text,
  room_expires_at timestamptz,
  winner_id uuid references teams(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Match Participants (for BR scoring)
create table match_participants (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  placement integer,
  eliminations integer default 0,
  damage integer default 0,
  score numeric default 0,
  checked_in boolean default false,
  created_at timestamptz default now()
);

-- Results & Evidence
create table results (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  submitted_by uuid references auth.users(id) on delete set null,
  placement integer,
  eliminations integer default 0,
  evidence_url text,
  notes text,
  submitted_at timestamptz default now()
);

-- Disputes
create table disputes (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  raised_by uuid references auth.users(id) on delete set null,
  reason text not null,
  evidence_url text,
  status text default 'open',
  resolved_by uuid references auth.users(id) on delete set null,
  resolution text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Player Statistics
create table player_statistics (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_matches integer default 0,
  wins integer default 0,
  booyahs integer default 0,
  total_eliminations integer default 0,
  total_damage integer default 0,
  average_placement numeric default 0,
  kd_ratio numeric default 0,
  win_rate numeric default 0,
  booyah_rate numeric default 0,
  headshot_rate numeric default 0,
  updated_at timestamptz default now()
);

-- Team Statistics
create table team_statistics (
  team_id uuid primary key references teams(id) on delete cascade,
  total_matches integer default 0,
  wins integer default 0,
  booyahs integer default 0,
  total_eliminations integer default 0,
  average_placement numeric default 0,
  kd_ratio numeric default 0,
  win_rate numeric default 0,
  booyah_rate numeric default 0,
  updated_at timestamptz default now()
);

-- Ratings
create table ratings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rating numeric default 1000,
  global_rank integer,
  regional_rank integer,
  country_rank integer,
  updated_at timestamptz default now()
);

-- Rating History
create table rating_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  old_rating numeric,
  new_rating numeric,
  reason text,
  match_id uuid references matches(id) on delete set null,
  created_at timestamptz default now()
);

-- Strategies
create table strategies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  map text not null,
  author_id uuid references auth.users(id) on delete set null,
  team_id uuid references teams(id) on delete set null,
  visibility strategy_visibility default 'private',
  version integer default 1,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Strategy Layers
create table strategy_layers (
  id uuid primary key default uuid_generate_v4(),
  strategy_id uuid references strategies(id) on delete cascade,
  name text not null,
  type text not null default 'markers',
  visible boolean default true,
  locked boolean default false,
  "order" integer default 0
);

-- Strategy Markers
create table strategy_markers (
  id uuid primary key default uuid_generate_v4(),
  layer_id uuid references strategy_layers(id) on delete cascade,
  strategy_id uuid references strategies(id) on delete cascade,
  type text not null,
  x numeric not null,
  y numeric not null,
  label text,
  color text default '#dc2626',
  role game_role,
  rotation numeric default 0,
  data jsonb default '{}'
);

-- Strategy Routes
create table strategy_routes (
  id uuid primary key default uuid_generate_v4(),
  layer_id uuid references strategy_layers(id) on delete cascade,
  strategy_id uuid references strategies(id) on delete cascade,
  type text not null default 'route',
  points jsonb not null default '[]',
  color text default '#dc2626',
  label text,
  animated boolean default false
);

-- Timeline Events
create table timeline_events (
  id uuid primary key default uuid_generate_v4(),
  strategy_id uuid references strategies(id) on delete cascade,
  phase text not null,
  label text not null,
  time_seconds integer not null default 0,
  duration_seconds integer default 30,
  data jsonb default '{}',
  "order" integer default 0
);

-- Channels
create table channels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'general',
  tournament_id uuid references tournaments(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  is_private boolean default false,
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  content text not null,
  reply_to uuid references messages(id) on delete set null,
  edited boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Reports
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type report_target_type not null,
  target_id uuid not null,
  reason report_reason not null,
  description text,
  status report_status default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- Audit Logs
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_username on profiles(username);
create index idx_profiles_region on profiles(region);
create index idx_profiles_status on profiles(status);
create index idx_profiles_looking_for_team on profiles(looking_for_team);

create index idx_team_members_team_id on team_members(team_id);
create index idx_team_members_user_id on team_members(user_id);

create index idx_tournaments_status on tournaments(status);
create index idx_tournaments_game on tournaments(game);
create index idx_tournaments_region on tournaments(region);
create index idx_tournaments_starts_at on tournaments(starts_at);

create index idx_matches_tournament_id on matches(tournament_id);
create index idx_matches_status on matches(status);
create index idx_matches_scheduled_at on matches(scheduled_at);

create index idx_match_participants_match_id on match_participants(match_id);
create index idx_match_participants_team_id on match_participants(team_id);
create index idx_match_participants_user_id on match_participants(user_id);

create index idx_strategies_author_id on strategies(author_id);
create index idx_strategies_team_id on strategies(team_id);
create index idx_strategies_map on strategies(map);
create index idx_strategies_visibility on strategies(visibility);

create index idx_strategy_markers_strategy_id on strategy_markers(strategy_id);
create index idx_strategy_markers_layer_id on strategy_markers(layer_id);
create index idx_strategy_routes_strategy_id on strategy_routes(strategy_id);

create index idx_channels_tournament_id on channels(tournament_id);
create index idx_channels_team_id on channels(team_id);
create index idx_messages_channel_id on messages(channel_id);
create index idx_messages_created_at on messages(created_at);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_read on notifications(read);

create index idx_reports_status on reports(status);
create index idx_reports_target on reports(target_type, target_id);

create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on audit_logs(created_at);

create index idx_ratings_rating on ratings(rating desc);
create index idx_ratings_global_rank on ratings(global_rank);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table tournaments enable row level security;
alter table tournament_registrations enable row level security;
alter table rounds enable row level security;
alter table matches enable row level security;
alter table match_participants enable row level security;
alter table results enable row level security;
alter table disputes enable row level security;
alter table strategies enable row level security;
alter table strategy_layers enable row level security;
alter table strategy_markers enable row level security;
alter table strategy_routes enable row level security;
alter table timeline_events enable row level security;
alter table channels enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;
alter table ratings enable row level security;
alter table rating_history enable row level security;
alter table player_statistics enable row level security;
alter table team_statistics enable row level security;

-- Profiles: public read, owner write
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);

-- Teams: public read, members write
create policy "Teams are viewable by everyone"
  on teams for select using (true);

create policy "Authenticated users can create teams"
  on teams for insert to authenticated with check (auth.uid() = created_by);

create policy "Team owners can update teams"
  on teams for update using (
    exists (
      select 1 from team_members
      where team_members.team_id = id
      and team_members.user_id = auth.uid()
      and team_members.role in ('owner', 'captain')
    )
  );

-- Team Members
create policy "Team members are viewable by everyone"
  on team_members for select using (true);

create policy "Team owners can manage members"
  on team_members for all using (
    exists (
      select 1 from team_members tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
    )
  );

-- Tournaments: public read, creator write
create policy "Tournaments are viewable by everyone"
  on tournaments for select using (true);

create policy "Authenticated users can create tournaments"
  on tournaments for insert to authenticated with check (auth.uid() = created_by);

create policy "Tournament creators can update"
  on tournaments for update using (auth.uid() = created_by);

-- Matches: public read
create policy "Matches are viewable by everyone"
  on matches for select using (true);

-- Strategies: visibility-based read
create policy "Public strategies are viewable by everyone"
  on strategies for select using (visibility = 'public');

create policy "Users can view their own strategies"
  on strategies for select using (auth.uid() = author_id);

create policy "Team members can view team strategies"
  on strategies for select using (
    visibility = 'team'
    and exists (
      select 1 from team_members
      where team_members.team_id = strategies.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create strategies"
  on strategies for insert to authenticated with check (auth.uid() = author_id);

create policy "Authors can update own strategies"
  on strategies for update using (auth.uid() = author_id);

-- Strategy Layers/Markers/Routes: follow strategy visibility
create policy "Strategy layers visible based on strategy"
  on strategy_layers for select using (
    exists (
      select 1 from strategies
      where strategies.id = strategy_layers.strategy_id
      and (
        strategies.visibility = 'public'
        or strategies.author_id = auth.uid()
        or (
          strategies.visibility = 'team'
          and exists (
            select 1 from team_members
            where team_members.team_id = strategies.team_id
            and team_members.user_id = auth.uid()
          )
        )
      )
    )
  );

create policy "Strategy markers visible based on strategy"
  on strategy_markers for select using (
    exists (
      select 1 from strategies
      where strategies.id = strategy_markers.strategy_id
      and (
        strategies.visibility = 'public'
        or strategies.author_id = auth.uid()
        or (
          strategies.visibility = 'team'
          and exists (
            select 1 from team_members
            where team_members.team_id = strategies.team_id
            and team_members.user_id = auth.uid()
          )
        )
      )
    )
  );

create policy "Strategy routes visible based on strategy"
  on strategy_routes for select using (
    exists (
      select 1 from strategies
      where strategies.id = strategy_routes.strategy_id
      and (
        strategies.visibility = 'public'
        or strategies.author_id = auth.uid()
        or (
          strategies.visibility = 'team'
          and exists (
            select 1 from team_members
            where team_members.team_id = strategies.team_id
            and team_members.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Messages: channel members only
create policy "Messages viewable by channel members"
  on messages for select using (
    exists (
      select 1 from channels
      where channels.id = messages.channel_id
      and (
        channels.is_private = false
        or channels.team_id is null
        or exists (
          select 1 from team_members
          where team_members.team_id = channels.team_id
          and team_members.user_id = auth.uid()
        )
      )
    )
  );

create policy "Authenticated users can send messages"
  on messages for insert to authenticated with check (auth.uid() = user_id);

-- Notifications: owner only
create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "System can create notifications"
  on notifications for insert to authenticated with check (true);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- Reports: reporter and admins only
create policy "Users can view own reports"
  on reports for select using (
    auth.uid() = reporter_id
    or exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.user_id in (
        select user_id from profiles where user_id = auth.uid()
      )
    )
  );

create policy "Authenticated users can create reports"
  on reports for insert to authenticated with check (auth.uid() = reporter_id);

-- Ratings: public read
create policy "Ratings are viewable by everyone"
  on ratings for select using (true);

create policy "Rating history viewable by everyone"
  on rating_history for select using (true);

-- Player Statistics: public read
create policy "Player statistics are viewable by everyone"
  on player_statistics for select using (true);

-- Team Statistics: public read
create policy "Team statistics are viewable by everyone"
  on team_statistics for select using (true);

-- Audit Logs: admin only
create policy "Admins can view audit logs"
  on audit_logs for select using (
    exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.user_id in (
        select user_id from profiles where user_id = auth.uid()
      )
    )
  );

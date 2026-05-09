-- RacketParty initial schema
-- Roles: coach, player, parent, club_admin
-- Use gen_random_uuid() (PG13+) so defaults work without uuid-ossp on the remote.

create type user_role as enum ('coach', 'player', 'parent', 'club_admin');
create type sport as enum ('tennis', 'pickleball', 'padel', 'squash', 'badminton');
create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'open');
create type lesson_status as enum ('scheduled', 'completed', 'cancelled');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'player',
  sport sport not null default 'pickleball',
  skill_level skill_level default 'intermediate',
  avatar_url text,
  bio text,
  club_id uuid,
  city text,
  created_at timestamptz default now()
);

create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  num_courts int default 0,
  num_members int default 0,
  booking_system text,
  created_at timestamptz default now()
);

alter table profiles
  add constraint profiles_club_fk foreign key (club_id) references clubs(id) on delete set null;

create table students (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  age int,
  skill_level skill_level default 'beginner',
  parent_email text,
  goals text,
  created_at timestamptz default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  scheduled_at timestamptz not null,
  duration_min int default 60,
  status lesson_status default 'scheduled',
  raw_transcript text,
  ai_summary text,
  ai_parent_update text,
  ai_next_plan text,
  technique_tags text[],
  created_at timestamptz default now()
);

create table drills (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  title text not null,
  sport sport default 'pickleball',
  skill_level skill_level default 'beginner',
  group_size text,
  duration_min int,
  goal text,
  description text,
  upvotes int default 0,
  is_public boolean default true,
  created_at timestamptz default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  sport sport default 'pickleball',
  skill_level skill_level default 'intermediate',
  starts_at timestamptz not null,
  city text,
  venue text,
  max_players int default 4,
  notes text,
  created_at timestamptz default now()
);

create table match_signups (
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (match_id, player_id)
);

create table highlights (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  video_url text,
  thumbnail_url text,
  ai_caption text,
  technique_callout text,
  created_at timestamptz default now()
);

create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

-- Court booking data imported from a club booking system.
create table court_bookings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  court_no int,
  starts_at timestamptz,
  duration_min int,
  price numeric,
  utilization_pct numeric,
  surface text,
  programming_type text
);

-- Row Level Security
alter table profiles enable row level security;
alter table students enable row level security;
alter table lessons enable row level security;
alter table drills enable row level security;
alter table matches enable row level security;
alter table match_signups enable row level security;
alter table highlights enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table clubs enable row level security;
alter table court_bookings enable row level security;

-- Profiles
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Coach-owned data
create policy "coach owns students" on students for all using (auth.uid() = coach_id);
create policy "coach owns lessons" on lessons for all using (auth.uid() = coach_id);

-- Drills (public read, author write)
create policy "drills are public read" on drills for select using (is_public or auth.uid() = author_id);
create policy "drill author writes" on drills for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- Matches
create policy "matches are public read" on matches for select using (true);
create policy "organizer manages match" on matches for all using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);
create policy "anyone signs up" on match_signups for all using (auth.uid() = player_id) with check (auth.uid() = player_id);
create policy "match signups public read" on match_signups for select using (true);

-- Highlights (lesson coach owns)
create policy "highlights via lesson coach" on highlights for all
  using (exists (select 1 from lessons l where l.id = highlights.lesson_id and l.coach_id = auth.uid()));

-- Chat
create policy "user owns threads" on chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns messages" on chat_messages for all
  using (exists (select 1 from chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid()))
  with check (exists (select 1 from chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid()));

-- Clubs (public read)
create policy "clubs public read" on clubs for select using (true);
create policy "court bookings public read" on court_bookings for select using (true);

-- Trigger: create profile on signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'player'::user_role)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

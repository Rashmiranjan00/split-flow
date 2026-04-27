-- SplitFlow: Initial schema
-- Run this in Supabase SQL Editor or via `supabase db push`.

-- =============================================================================
-- 1. TABLES
-- =============================================================================

create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null,
  email      text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  cover_image text,
  created_by  uuid not null references auth.users on delete set null,
  created_at  timestamptz not null default now()
);

create table public.group_members (
  group_id   uuid not null references public.groups on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.groups on delete cascade,
  title        text not null,
  amount_minor integer not null check (amount_minor >= 0),
  paid_by      uuid not null references auth.users,
  split_type   text not null check (split_type in ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES')),
  category     text,
  created_at   timestamptz not null default now()
);

create table public.expense_participants (
  expense_id uuid not null references public.expenses on delete cascade,
  user_id    uuid not null references auth.users,
  primary key (expense_id, user_id)
);

create table public.expense_splits (
  expense_id uuid not null references public.expenses on delete cascade,
  user_id    uuid not null references auth.users,
  owed_minor integer not null check (owed_minor >= 0),
  primary key (expense_id, user_id)
);

create table public.settlements (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.groups on delete cascade,
  from_user    uuid not null references auth.users,
  to_user      uuid not null references auth.users,
  amount_minor integer not null check (amount_minor > 0),
  created_at   timestamptz not null default now()
);

create table public.friendships (
  owner_id   uuid not null references auth.users on delete cascade,
  friend_id  uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, friend_id),
  check (owner_id <> friend_id)
);

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

create index idx_expenses_group_id              on public.expenses (group_id);
create index idx_expense_splits_expense_id      on public.expense_splits (expense_id);
create index idx_expense_participants_expense_id on public.expense_participants (expense_id);
create index idx_settlements_group_id           on public.settlements (group_id);
create index idx_group_members_user_id          on public.group_members (user_id);

-- =============================================================================
-- 3. HELPER FUNCTIONS
-- =============================================================================

-- Profile auto-creation on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS helper: avoids recursive policy lookups on group_members
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists(
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- =============================================================================
-- 4. ATOMIC EXPENSE CREATION RPC
-- =============================================================================

create or replace function public.create_expense(
  p_group_id     uuid,
  p_title        text,
  p_amount_minor integer,
  p_paid_by      uuid,
  p_split_type   text,
  p_category     text,
  p_participants uuid[],
  p_splits       jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if not public.is_group_member(p_group_id) then
    raise exception 'Not a member of this group';
  end if;

  insert into public.expenses (group_id, title, amount_minor, paid_by, split_type, category)
  values (p_group_id, p_title, p_amount_minor, p_paid_by, p_split_type, p_category)
  returning id into new_id;

  insert into public.expense_participants (expense_id, user_id)
  select new_id, unnest(p_participants);

  insert into public.expense_splits (expense_id, user_id, owed_minor)
  select new_id, (v ->> 'userId')::uuid, (v ->> 'owedMinor')::integer
  from jsonb_array_elements(p_splits) v;

  return new_id;
end;
$$;

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================

-- profiles ----
alter table public.profiles enable row level security;

create policy "Users can view profiles of group co-members"
  on public.profiles for select
  using (
    id = auth.uid()
    or id in (
      select gm2.user_id
      from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid()
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- groups ----
alter table public.groups enable row level security;

create policy "Members can view their groups"
  on public.groups for select
  using (public.is_group_member(id));

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (created_by = auth.uid());

create policy "Creator can update group"
  on public.groups for update
  using (created_by = auth.uid());

create policy "Creator can delete group"
  on public.groups for delete
  using (created_by = auth.uid());

-- group_members ----
alter table public.group_members enable row level security;

create policy "Members can view group membership"
  on public.group_members for select
  using (public.is_group_member(group_id));

create policy "Members or creator can add members"
  on public.group_members for insert
  with check (
    public.is_group_member(group_id)
    or group_id in (select id from public.groups where created_by = auth.uid())
  );

create policy "Members can remove themselves"
  on public.group_members for delete
  using (user_id = auth.uid());

-- expenses ----
alter table public.expenses enable row level security;

create policy "Members can view group expenses"
  on public.expenses for select
  using (public.is_group_member(group_id));

create policy "Members can create expenses"
  on public.expenses for insert
  with check (public.is_group_member(group_id));

-- expense_participants ----
alter table public.expense_participants enable row level security;

create policy "Members can view expense participants"
  on public.expense_participants for select
  using (
    expense_id in (
      select id from public.expenses where public.is_group_member(group_id)
    )
  );

create policy "Members can insert expense participants"
  on public.expense_participants for insert
  with check (
    expense_id in (
      select id from public.expenses where public.is_group_member(group_id)
    )
  );

-- expense_splits ----
alter table public.expense_splits enable row level security;

create policy "Members can view expense splits"
  on public.expense_splits for select
  using (
    expense_id in (
      select id from public.expenses where public.is_group_member(group_id)
    )
  );

create policy "Members can insert expense splits"
  on public.expense_splits for insert
  with check (
    expense_id in (
      select id from public.expenses where public.is_group_member(group_id)
    )
  );

-- settlements ----
alter table public.settlements enable row level security;

create policy "Members can view group settlements"
  on public.settlements for select
  using (public.is_group_member(group_id));

create policy "Members can create settlements"
  on public.settlements for insert
  with check (public.is_group_member(group_id));

-- friendships ----
alter table public.friendships enable row level security;

create policy "Users can view own friendships"
  on public.friendships for select
  using (owner_id = auth.uid());

create policy "Users can add friends"
  on public.friendships for insert
  with check (owner_id = auth.uid());

create policy "Users can remove friends"
  on public.friendships for delete
  using (owner_id = auth.uid());

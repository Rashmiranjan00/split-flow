-- SplitFlow: Friends flow + group-creation fix
-- Run this in Supabase SQL Editor or via `supabase db push` after 0001_init.sql.
--
-- This migration:
--   1. Fixes a pre-existing bug where creating a group always failed because
--      the SELECT RLS policy on `groups` required membership, but membership
--      could not be inserted until the creator could SELECT the new group.
--      Fix: atomic `create_group` SECURITY DEFINER RPC.
--   2. Adds the full Friends flow (requests table, RPCs, RLS).

-- =============================================================================
-- 1. FRIEND REQUESTS TABLE
-- =============================================================================

create table public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  from_user    uuid not null references auth.users on delete cascade,
  to_user      uuid not null references auth.users on delete cascade,
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (from_user <> to_user)
);

-- A given direction can only have one pending request at a time. Accepted /
-- rejected rows are history and may coexist with a new pending row.
create unique index friend_requests_unique_pending
  on public.friend_requests (from_user, to_user)
  where status = 'pending';

create index idx_friend_requests_to_user_pending
  on public.friend_requests (to_user, status)
  where status = 'pending';

create index idx_friend_requests_from_user_pending
  on public.friend_requests (from_user, status)
  where status = 'pending';

-- =============================================================================
-- 2. RLS: profiles open to authenticated users (needed for email search)
-- =============================================================================

drop policy if exists "Users can view profiles of group co-members" on public.profiles;

create policy "Authenticated users can view profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- =============================================================================
-- 3. RLS: friendships mutations only via SECURITY DEFINER RPCs
-- =============================================================================

drop policy if exists "Users can add friends"    on public.friendships;
drop policy if exists "Users can remove friends" on public.friendships;

-- SELECT policy "Users can view own friendships" from 0001_init.sql is kept.
-- With no INSERT / DELETE / UPDATE policies, direct client mutations are blocked.
-- Friendships can only be created via `accept_friend_request` or removed via
-- `remove_friend`, both of which are SECURITY DEFINER and bypass RLS.

-- =============================================================================
-- 4. RLS: friend_requests
-- =============================================================================

alter table public.friend_requests enable row level security;

create policy "Users can view own friend requests"
  on public.friend_requests for select
  using (from_user = auth.uid() or to_user = auth.uid());

-- No INSERT / UPDATE / DELETE policies -- only the RPCs mutate.

-- =============================================================================
-- 5. RPC: send_friend_request
-- =============================================================================

create or replace function public.send_friend_request(p_to_user uuid)
returns public.friend_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_row    public.friend_requests;
begin
  if v_caller is null then
    raise exception 'Not authenticated';
  end if;

  if p_to_user = v_caller then
    raise exception 'You cannot send a friend request to yourself';
  end if;

  if not exists (select 1 from public.profiles where id = p_to_user) then
    raise exception 'User does not exist';
  end if;

  if exists (
    select 1 from public.friendships
    where owner_id = v_caller and friend_id = p_to_user
  ) then
    raise exception 'You are already friends with this user';
  end if;

  if exists (
    select 1 from public.friend_requests
    where status = 'pending'
      and (
        (from_user = v_caller and to_user = p_to_user)
        or (from_user = p_to_user and to_user = v_caller)
      )
  ) then
    raise exception 'A pending request already exists between you two';
  end if;

  insert into public.friend_requests (from_user, to_user, status)
  values (v_caller, p_to_user, 'pending')
  returning * into v_row;

  return v_row;
end;
$$;

-- =============================================================================
-- 6. RPC: accept_friend_request
-- =============================================================================

create or replace function public.accept_friend_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_req    public.friend_requests;
begin
  if v_caller is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_req
  from public.friend_requests
  where id = p_request_id;

  if v_req is null then
    raise exception 'Friend request not found';
  end if;

  if v_req.to_user <> v_caller then
    raise exception 'Only the recipient can accept this request';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'This request has already been responded to';
  end if;

  update public.friend_requests
  set status = 'accepted', responded_at = now()
  where id = p_request_id;

  -- Atomic bidirectional friendship insert. `on conflict do nothing` guards
  -- against race conditions (unlikely, but cheap insurance).
  insert into public.friendships (owner_id, friend_id)
  values (v_req.from_user, v_req.to_user)
  on conflict do nothing;

  insert into public.friendships (owner_id, friend_id)
  values (v_req.to_user, v_req.from_user)
  on conflict do nothing;
end;
$$;

-- =============================================================================
-- 7. RPC: reject_friend_request
-- =============================================================================

create or replace function public.reject_friend_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_req    public.friend_requests;
begin
  if v_caller is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_req
  from public.friend_requests
  where id = p_request_id;

  if v_req is null then
    raise exception 'Friend request not found';
  end if;

  -- Either side (recipient rejecting, sender cancelling) may reject.
  if v_req.to_user <> v_caller and v_req.from_user <> v_caller then
    raise exception 'Not authorized';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'This request has already been responded to';
  end if;

  update public.friend_requests
  set status = 'rejected', responded_at = now()
  where id = p_request_id;
end;
$$;

-- =============================================================================
-- 8. RPC: remove_friend
-- =============================================================================

create or replace function public.remove_friend(p_friend_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.friendships
  where (owner_id = v_caller and friend_id = p_friend_id)
     or (owner_id = p_friend_id and friend_id = v_caller);
end;
$$;

-- =============================================================================
-- 9. RPC: create_group
-- =============================================================================
-- Atomically creates a group, adds the creator as a member, and optionally
-- adds a list of friends as members. Bypasses the SELECT-RLS chicken-and-egg
-- that made direct `insert into groups` fail.

create or replace function public.create_group(
  p_name        text,
  p_description text default null,
  p_cover_image text default null,
  p_member_ids  uuid[] default array[]::uuid[]
)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_group  public.groups;
  v_mid    uuid;
begin
  if v_caller is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Group name is required';
  end if;

  insert into public.groups (name, description, cover_image, created_by)
  values (p_name, p_description, p_cover_image, v_caller)
  returning * into v_group;

  insert into public.group_members (group_id, user_id)
  values (v_group.id, v_caller);

  if p_member_ids is not null then
    foreach v_mid in array p_member_ids loop
      if v_mid = v_caller then
        continue;
      end if;

      -- Friends-only: defence in depth against a malicious client trying to
      -- add a non-friend to a group.
      if not exists (
        select 1 from public.friendships
        where owner_id = v_caller and friend_id = v_mid
      ) then
        raise exception 'User % is not in your friends list', v_mid;
      end if;

      insert into public.group_members (group_id, user_id)
      values (v_group.id, v_mid)
      on conflict do nothing;
    end loop;
  end if;

  return v_group;
end;
$$;

-- =============================================================================
-- 10. Grants
-- =============================================================================

grant execute on function public.send_friend_request(uuid)                     to authenticated;
grant execute on function public.accept_friend_request(uuid)                   to authenticated;
grant execute on function public.reject_friend_request(uuid)                   to authenticated;
grant execute on function public.remove_friend(uuid)                           to authenticated;
grant execute on function public.create_group(text, text, text, uuid[])        to authenticated;

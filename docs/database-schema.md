# Database Schema

> PostgreSQL via Supabase. All migrations in `supabase/migrations/`.

---

## Entity Relationship Overview

```
profiles ──┐
           ├──< group_members >──── groups
           │                          │
           ├──< expense_participants  │
           │         │                │
           ├──< expense_splits        │
           │         │                │
           │    expenses ─────────────┘
           │         │
           ├──< settlements ──────────┘
           │
           ├──< friendships (bidirectional)
           │
           └──< friend_requests
```

---

## Tables

### `profiles`

Auto-created via trigger on `auth.users` insert.

| Column       | Type        | Constraints                     |
| ------------ | ----------- | ------------------------------- |
| `id`         | UUID        | PK, references `auth.users(id)` |
| `name`       | TEXT        | NOT NULL                        |
| `email`      | TEXT        | NOT NULL                        |
| `avatar_url` | TEXT        | nullable                        |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()`                 |

**Trigger:** `on_auth_user_created` — fires `AFTER INSERT ON auth.users`, calls `handle_new_user()` which inserts into `profiles` using `raw_user_meta_data`.

---

### `groups`

| Column        | Type        | Constraints                     |
| ------------- | ----------- | ------------------------------- |
| `id`          | UUID        | PK, DEFAULT `gen_random_uuid()` |
| `name`        | TEXT        | NOT NULL                        |
| `description` | TEXT        | nullable                        |
| `cover_image` | TEXT        | nullable                        |
| `created_by`  | UUID        | FK → `profiles(id)`             |
| `created_at`  | TIMESTAMPTZ | DEFAULT `now()`                 |

---

### `group_members`

Composite primary key — tracks group membership.

| Column      | Type        | Constraints                               |
| ----------- | ----------- | ----------------------------------------- |
| `group_id`  | UUID        | PK, FK → `groups(id)` ON DELETE CASCADE   |
| `user_id`   | UUID        | PK, FK → `profiles(id)` ON DELETE CASCADE |
| `joined_at` | TIMESTAMPTZ | DEFAULT `now()`                           |

---

### `expenses`

All monetary amounts stored as **integer cents** (`amount_minor`).

| Column         | Type        | Constraints                                    |
| -------------- | ----------- | ---------------------------------------------- |
| `id`           | UUID        | PK, DEFAULT `gen_random_uuid()`                |
| `group_id`     | UUID        | FK → `groups(id)` ON DELETE CASCADE            |
| `title`        | TEXT        | NOT NULL                                       |
| `amount_minor` | INTEGER     | NOT NULL (cents)                               |
| `paid_by`      | UUID        | FK → `profiles(id)`                            |
| `split_type`   | TEXT        | `EQUAL` \| `EXACT` \| `PERCENTAGE` \| `SHARES` |
| `category`     | TEXT        | nullable                                       |
| `notes`        | TEXT        | nullable                                       |
| `receipt_url`  | TEXT        | nullable                                       |
| `created_at`   | TIMESTAMPTZ | DEFAULT `now()`                                |

---

### `expense_participants`

Tracks who is involved in an expense.

| Column       | Type | Constraints                               |
| ------------ | ---- | ----------------------------------------- |
| `expense_id` | UUID | PK, FK → `expenses(id)` ON DELETE CASCADE |
| `user_id`    | UUID | PK, FK → `profiles(id)` ON DELETE CASCADE |

---

### `expense_splits`

Individual split amounts per participant.

| Column       | Type    | Constraints                               |
| ------------ | ------- | ----------------------------------------- |
| `expense_id` | UUID    | PK, FK → `expenses(id)` ON DELETE CASCADE |
| `user_id`    | UUID    | PK, FK → `profiles(id)` ON DELETE CASCADE |
| `owed_minor` | INTEGER | NOT NULL (cents)                          |

---

### `settlements`

Atomic payment records between users within a group.

| Column         | Type        | Constraints                         |
| -------------- | ----------- | ----------------------------------- |
| `id`           | UUID        | PK, DEFAULT `gen_random_uuid()`     |
| `group_id`     | UUID        | FK → `groups(id)` ON DELETE CASCADE |
| `from_user`    | UUID        | FK → `profiles(id)`                 |
| `to_user`      | UUID        | FK → `profiles(id)`                 |
| `amount_minor` | INTEGER     | NOT NULL (cents)                    |
| `created_at`   | TIMESTAMPTZ | DEFAULT `now()`                     |

---

### `friendships`

Directional friendship records — always stored bidirectionally (A→B and B→A).

| Column      | Type        | Constraints                               |
| ----------- | ----------- | ----------------------------------------- |
| `owner_id`  | UUID        | PK, FK → `profiles(id)` ON DELETE CASCADE |
| `friend_id` | UUID        | PK, FK → `profiles(id)` ON DELETE CASCADE |
| `added_at`  | TIMESTAMPTZ | DEFAULT `now()`                           |

**CHECK:** `owner_id ≠ friend_id` (no self-friendship)

---

### `friend_requests`

| Column         | Type        | Constraints                           |
| -------------- | ----------- | ------------------------------------- |
| `id`           | UUID        | PK, DEFAULT `gen_random_uuid()`       |
| `from_user`    | UUID        | FK → `profiles(id)` ON DELETE CASCADE |
| `to_user`      | UUID        | FK → `profiles(id)` ON DELETE CASCADE |
| `status`       | TEXT        | `pending` \| `accepted` \| `rejected` |
| `created_at`   | TIMESTAMPTZ | DEFAULT `now()`                       |
| `responded_at` | TIMESTAMPTZ | nullable                              |

**UNIQUE:** `(from_user, to_user) WHERE status = 'pending'` — prevents duplicate pending requests.

---

## Indexes

| Index                        | Table           | Columns      | Purpose                           |
| ---------------------------- | --------------- | ------------ | --------------------------------- |
| `idx_group_members_user`     | group_members   | `user_id`    | Fast "my groups" lookup           |
| `idx_expenses_group`         | expenses        | `group_id`   | Fast expense listing per group    |
| `idx_expense_splits_expense` | expense_splits  | `expense_id` | Fast split retrieval              |
| `idx_settlements_group`      | settlements     | `group_id`   | Fast settlement listing per group |
| `idx_friend_requests_to`     | friend_requests | `to_user`    | Fast incoming request lookup      |

---

## Row-Level Security (RLS)

All tables have RLS enabled. Access is controlled by a combination of policies and RPCs.

### Helper Function

```sql
CREATE FUNCTION is_group_member(gid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = gid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Policy Summary

| Table                  | SELECT            | INSERT        | UPDATE       | DELETE       |
| ---------------------- | ----------------- | ------------- | ------------ | ------------ |
| `profiles`             | All authenticated | Self only     | Self only    | —            |
| `groups`               | Members only      | Via RPC       | Members only | Creator only |
| `group_members`        | Members only      | Via RPC       | —            | Self only    |
| `expenses`             | Group members     | Via RPC       | —            | —            |
| `expense_participants` | Group members     | Via RPC       | —            | —            |
| `expense_splits`       | Group members     | Via RPC       | —            | —            |
| `settlements`          | Group members     | Group members | —            | —            |
| `friendships`          | Own records       | Via RPC       | —            | Via RPC      |
| `friend_requests`      | Own records       | Via RPC       | Via RPC      | —            |

**Key principle:** Direct INSERT/UPDATE on sensitive tables is blocked; all mutations go through Security Definer RPCs that enforce business rules atomically.

---

## Security Definer RPCs

### `create_expense()`

Creates expense + participants + splits atomically.

```sql
create_expense(
  p_group_id    UUID,
  p_title       TEXT,
  p_amount      INTEGER,      -- cents
  p_paid_by     UUID,
  p_split_type  TEXT,
  p_category    TEXT,
  p_participants UUID[],
  p_splits      JSONB         -- [{ user_id, owed_minor }]
) RETURNS UUID
```

**Logic:**

1. Insert into `expenses`
2. Insert each participant into `expense_participants`
3. Insert each split into `expense_splits`
4. Return new expense ID

---

### `create_group()`

Creates group + adds creator + adds selected friends as members.

```sql
create_group(
  p_name        TEXT,
  p_description TEXT,
  p_members     UUID[]        -- friend IDs to add
) RETURNS UUID
```

**Logic:**

1. Insert into `groups` with `created_by = auth.uid()`
2. Insert creator into `group_members`
3. Insert each member from `p_members` into `group_members` (ON CONFLICT DO NOTHING)
4. Return new group ID

**Why RPC?** Solves the RLS chicken-and-egg problem — you can't be a member until the group exists, but you can't create a group unless you're a member.

---

### `send_friend_request()`

```sql
send_friend_request(p_to_user UUID) RETURNS UUID
```

**Validations:**

- Cannot send to self
- Target user must exist in `profiles`
- No duplicate pending request (UNIQUE constraint handles this)

**Logic:** Insert into `friend_requests` with `status = 'pending'`, return request ID.

---

### `accept_friend_request()`

```sql
accept_friend_request(p_request_id UUID) RETURNS VOID
```

**Validations:**

- Request must exist and be `pending`
- Caller must be the `to_user` (recipient)

**Logic:**

1. Update request status to `accepted`, set `responded_at`
2. Insert bidirectional friendship records (A→B and B→A)
3. Uses `ON CONFLICT DO NOTHING` for idempotency

---

### `reject_friend_request()`

```sql
reject_friend_request(p_request_id UUID) RETURNS VOID
```

**Validations:**

- Request must exist and be `pending`
- Caller must be either `from_user` (cancel) or `to_user` (reject)

**Logic:** Update status to `rejected`, set `responded_at`.

---

### `remove_friend()`

```sql
remove_friend(p_friend_id UUID) RETURNS VOID
```

**Logic:** Delete both directional friendship records (owner→friend and friend→owner).

---

## Money Handling Convention

All monetary values in the database are stored as **integer cents** (`amount_minor`, `owed_minor`):

```
$42.50 → stored as 4250
$0.01  → stored as 1
```

Conversion happens at the API boundary using:

- `toCents(dollars)` → multiply by 100 and round
- `fromCents(cents)` → divide by 100

This eliminates floating-point precision errors in financial calculations.

---

## Migration History

| File                    | Description                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_init.sql`         | Base schema: profiles, groups, group_members, expenses, expense_participants, expense_splits, settlements, friendships. Trigger for auto-profile creation. `create_expense` RPC. Indexes. RLS policies. |
| `0002_friends_flow.sql` | Friends system: `friend_requests` table. 4 new RPCs (send/accept/reject/remove). `create_group` RPC. RLS policy overhaul for friend tables.                                                             |

---

## Related Documentation

- [Architecture Overview](./architecture-overview.md) — Tech stack, project structure
- [Data Flow & State Management](./data-flow-and-state-management.md) — API layer, mappers, React Query
- [Supabase Setup Guide](./supabase-setup.md) — Deployment instructions

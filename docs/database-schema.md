# Database Schema

> Supabase (Postgres) schema for Restaumat.
> Always enable Row Level Security (RLS) on every table.

---

## Tables

### `restaurants`

Stores all restaurants added by users.

```sql
create table restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  lat         double precision not null,
  lng         double precision not null,
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table restaurants enable row level security;

-- Anyone can read all restaurants
create policy "restaurants: public read"
  on restaurants for select
  using (true);

-- Only creator can insert
create policy "restaurants: insert own"
  on restaurants for insert
  with check (auth.uid() = created_by);

-- Only creator can update
create policy "restaurants: update own"
  on restaurants for update
  using (auth.uid() = created_by);

-- Only creator can delete
create policy "restaurants: delete own"
  on restaurants for delete
  using (auth.uid() = created_by);
```

---

### `ratings`

User ratings and notes for restaurants. One rating per user per restaurant.

```sql
create table ratings (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  score          smallint not null check (score between 1 and 5),
  note           text,
  created_at     timestamptz not null default now(),
  unique (restaurant_id, user_id)   -- one rating per user per restaurant
);

alter table ratings enable row level security;

-- Anyone can read ratings
create policy "ratings: public read"
  on ratings for select
  using (true);

-- Only owner can insert their own rating
create policy "ratings: insert own"
  on ratings for insert
  with check (auth.uid() = user_id);

-- Only owner can update their own rating
create policy "ratings: update own"
  on ratings for update
  using (auth.uid() = user_id);

-- Only owner can delete their own rating
create policy "ratings: delete own"
  on ratings for delete
  using (auth.uid() = user_id);
```

---

### `bookmarks`

Users can bookmark restaurants they want to visit.

```sql
create table bookmarks (
  id             uuid primary key default gen_random_uuid(),
  restaurant_id  uuid not null references restaurants(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

alter table bookmarks enable row level security;

-- Users can only see their own bookmarks
create policy "bookmarks: read own"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "bookmarks: insert own"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "bookmarks: delete own"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

---

## Useful Views (Optional)

```sql
-- Restaurant with average score and rating count
create view restaurants_with_stats as
select
  r.*,
  coalesce(avg(rt.score), 0)::numeric(3,1) as avg_score,
  count(rt.id)::int                         as rating_count
from restaurants r
left join ratings rt on rt.restaurant_id = r.id
group by r.id;
```

---

## Indexes

```sql
-- Spatial queries by bounding box (lat/lng)
create index on restaurants (lat, lng);

-- Foreign key lookups
create index on ratings (restaurant_id);
create index on ratings (user_id);
create index on bookmarks (user_id);
```

---

## Free Tier Notes

- Supabase free tier: 500 MB database, 50k MAU
- Do not store images in the database — use Supabase Storage (bucket: `restaurant-photos`)
- Periodically purge orphaned records if needed

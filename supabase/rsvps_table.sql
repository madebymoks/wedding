-- ============================================================
-- RSVPS TABLE
-- Matches the RSVP form fields exactly (src/App.jsx, Rsvp component):
--   name, attending, partySize, mobileNumber, message
--
-- This replaces the earlier guests/rsvp_responses token-based design
-- (supabase/rsvp_setup.sql) — the app no longer uses that flow, this
-- is a single open table anyone can submit to.
-- ============================================================

create table public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  attending      text not null check (attending in ('yes', 'no')),
  party_size     integer not null check (party_size between 1 and 10),
  mobile_number  text not null,
  message        text check (char_length(message) <= 500),
  created_at     timestamptz not null default now()
);

create index on public.rsvps (created_at);
create index on public.rsvps (attending);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Anyone (anon key) can submit an RSVP, but nobody can read,
-- edit, or delete existing rows from the public site — names,
-- phone numbers, etc. stay private. View responses via the
-- Supabase dashboard/table editor, which reads as the table
-- owner and bypasses RLS.
-- ------------------------------------------------------------
alter table public.rsvps enable row level security;

create policy "Anyone can submit an RSVP"
  on public.rsvps for insert
  to anon
  with check (true);

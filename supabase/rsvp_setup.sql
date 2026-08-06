-- ============================================================
-- RSVP SETUP
-- Run these steps in order in the Supabase SQL editor.
-- Assumes the base schema (profiles, invitations, guests,
-- rsvp_responses, invitation_views) already exists.
-- ============================================================


-- ------------------------------------------------------------
-- STEP 1 — create the owner's auth user (dashboard, not SQL)
-- ------------------------------------------------------------
-- Supabase manages auth.users directly, so this can't be a plain
-- INSERT. Instead:
--   1. Supabase dashboard → Authentication → Users → Add user
--   2. Create a user with your email (+ password, or send an
--      invite email)
--   3. Copy the generated "User UID"
--
-- Replace every <OWNER_AUTH_UID> below with that UID before running.


-- ------------------------------------------------------------
-- STEP 2 — matching profile row
-- ------------------------------------------------------------
insert into public.profiles (id, full_name, email)
values ('<OWNER_AUTH_UID>', 'Mookamedi & Kago', '<your-email>')
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- STEP 3 — the invitation row for this wedding
-- ------------------------------------------------------------
insert into public.invitations (
  owner_id, title, slug, status,
  event_date, start_time, venue_name, venue_address, dress_code
) values (
  '<OWNER_AUTH_UID>',
  'Mookamedi & Kago Wedding',
  'mookamedi-and-kago',
  'published',
  '2026-10-17',
  '14:00',
  'Molapo Gardens',
  'Xhosa 1, Mahalapye',
  'Cocktail / formal — dark suit and tie'
)
returning id;
-- ⤷ copy the returned id — you won't need it in the app config,
--   but you'll use it below if inserting guests in the same session


-- ------------------------------------------------------------
-- STEP 4 — add guests
-- ------------------------------------------------------------
-- unique_token is generated automatically per guest. Each guest's
-- personal RSVP link is:  https://yoursite.com/?t=<unique_token>
insert into public.guests (invitation_id, first_name, last_name, group_name)
values
  ('<INVITATION_ID>', 'Jane', 'Doe', 'Bride''s family'),
  ('<INVITATION_ID>', 'John', 'Smith', 'Groom''s friends')
returning id, first_name, last_name, unique_token;


-- ============================================================
-- STEP 5 — RPC functions
-- These are the only way the public site (anon key) can read or
-- write guest/RSVP data — RLS otherwise restricts everything to
-- the invitation owner. Each function validates the guest's
-- unique_token itself before touching any row.
-- ============================================================

-- Fetch a guest's invitation + current RSVP status by their token.
-- Returns zero rows if the token doesn't match any guest.
create or replace function public.get_invite(p_token text)
returns table (
  guest_id          uuid,
  first_name        text,
  last_name         text,
  invitation_id     uuid,
  invitation_title  text,
  event_date        date,
  start_time        time,
  venue_name        text,
  rsvp_deadline     date,
  status            text,
  meal_preference   text,
  dietary_notes     text,
  has_plus_one      boolean,
  plus_one_name     text,
  plus_one_meal     text
)
language sql
security definer
set search_path = public
as $$
  select
    g.id, g.first_name, g.last_name,
    i.id, i.title, i.event_date, i.start_time, i.venue_name, i.rsvp_deadline,
    coalesce(r.status, 'pending'),
    r.meal_preference, r.dietary_notes,
    coalesce(r.has_plus_one, false), r.plus_one_name, r.plus_one_meal
  from public.guests g
  join public.invitations i on i.id = g.invitation_id
  left join public.rsvp_responses r on r.guest_id = g.id
  where g.unique_token = p_token;
$$;

revoke execute on function public.get_invite(text) from public;
grant execute on function public.get_invite(text) to anon, authenticated;


-- Create or update a guest's RSVP by their token.
create or replace function public.submit_rsvp(
  p_token           text,
  p_status          text,
  p_meal_preference text default null,
  p_dietary_notes   text default null,
  p_has_plus_one    boolean default false,
  p_plus_one_name   text default null,
  p_plus_one_meal   text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_id uuid;
  v_invitation_id uuid;
begin
  select g.id, g.invitation_id into v_guest_id, v_invitation_id
  from public.guests g
  where g.unique_token = p_token;

  if v_guest_id is null then
    raise exception 'Invalid RSVP link';
  end if;

  if p_status not in ('attending', 'declined') then
    raise exception 'Invalid status';
  end if;

  insert into public.rsvp_responses (
    guest_id, invitation_id, status, responded_at,
    meal_preference, dietary_notes, has_plus_one, plus_one_name, plus_one_meal,
    responded_via
  ) values (
    v_guest_id, v_invitation_id, p_status, now(),
    p_meal_preference, p_dietary_notes, p_has_plus_one, p_plus_one_name, p_plus_one_meal,
    'web'
  )
  on conflict (guest_id) do update set
    status = excluded.status,
    responded_at = now(),
    meal_preference = excluded.meal_preference,
    dietary_notes = excluded.dietary_notes,
    has_plus_one = excluded.has_plus_one,
    plus_one_name = excluded.plus_one_name,
    plus_one_meal = excluded.plus_one_meal,
    responded_via = 'web',
    updated_at = now();
end;
$$;

revoke execute on function public.submit_rsvp(text, text, text, text, boolean, text, text) from public;
grant execute on function public.submit_rsvp(text, text, text, text, boolean, text, text) to anon, authenticated;


-- Record that a guest opened their invitation. Silently no-ops on
-- an invalid token instead of erroring, since this call shouldn't
-- ever block the page from rendering.
create or replace function public.log_invitation_view(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_id uuid;
  v_invitation_id uuid;
begin
  select g.id, g.invitation_id into v_guest_id, v_invitation_id
  from public.guests g
  where g.unique_token = p_token;

  if v_guest_id is null then
    return;
  end if;

  insert into public.invitation_views (invitation_id, guest_id)
  values (v_invitation_id, v_guest_id);
end;
$$;

revoke execute on function public.log_invitation_view(text) from public;
grant execute on function public.log_invitation_view(text) to anon, authenticated;

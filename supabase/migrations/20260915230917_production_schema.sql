create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create schema if not exists private;

create type public.app_role as enum ('master_admin','manager','instructor','student');
create type public.session_status as enum ('draft','published','cancelled','completed');
create type public.registration_status as enum ('confirmed','waitlisted','cancelled');
create type public.attendance_status as enum ('unmarked','present','absent','excused');
create type public.payment_status as enum ('not_required','unpaid','paid','refunded','failed');
create type public.consent_status as enum ('opted_in','opted_out');
create type public.communication_channel as enum ('email','sms');
create type public.delivery_status as enum ('pending','sent','delivered','failed','bounced','undelivered','suppressed');
create type public.content_status as enum ('draft','published','scheduled','archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  phone text,
  avatar_path text,
  sms_opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_lower_idx on public.profiles(lower(email));

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  primary key(user_id,role)
);

create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  public_name text not null default 'Instructor',
  bio text not null default '',
  dance_styles text[] not null default '{}',
  active boolean not null default true,
  can_mark_attendance boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.instructor_availability (
  id uuid primary key default gen_random_uuid(), instructor_id uuid not null references public.instructors(id) on delete cascade,
  starts_at timestamptz not null, ends_at timestamptz not null, notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at > starts_at), unique(instructor_id,starts_at,ends_at)
);
create index availability_instructor_time_idx on public.instructor_availability(instructor_id,starts_at,ends_at);

create table public.class_types (
  id uuid primary key default gen_random_uuid(), name text not null unique, description text not null default '', level text,
  duration_minutes integer not null default 60 check(duration_minutes between 15 and 480),
  default_capacity integer not null default 20 check(default_capacity > 0),
  default_price_cents integer not null default 0 check(default_price_cents >= 0), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(), class_type_id uuid not null references public.class_types(id),
  instructor_id uuid not null references public.instructors(id), starts_at timestamptz not null, ends_at timestamptz not null,
  capacity integer not null check(capacity > 0), price_cents integer not null default 0 check(price_cents >= 0),
  location text, status public.session_status not null default 'draft', recurrence_group_id uuid,
  cancellation_reason text, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends_at > starts_at),
  exclude using gist (instructor_id with =, tstzrange(starts_at,ends_at,'[)') with &&) where (status in ('draft','published'))
);
create index sessions_public_schedule_idx on public.class_sessions(status,starts_at);
create index sessions_instructor_idx on public.class_sessions(instructor_id,starts_at);

create table public.registrations (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.class_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, status public.registration_status not null,
  waitlist_position integer check(waitlist_position is null or waitlist_position > 0),
  attendance_status public.attendance_status not null default 'unmarked',
  payment_status public.payment_status not null default 'unpaid', amount_cents integer not null default 0 check(amount_cents >= 0),
  internal_notes text, registered_at timestamptz not null default now(), cancelled_at timestamptz, promoted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(session_id,user_id)
);
create index registrations_session_status_idx on public.registrations(session_id,status,waitlist_position);
create index registrations_user_idx on public.registrations(user_id,registered_at desc);

create table public.communication_consents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  channel public.communication_channel not null, status public.consent_status not null,
  consented_at timestamptz, opted_out_at timestamptz, source text, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(user_id,channel)
);

create table public.communication_logs (
  id uuid primary key default gen_random_uuid(), session_id uuid references public.class_sessions(id) on delete set null,
  registration_id uuid references public.registrations(id) on delete set null, user_id uuid references public.profiles(id) on delete set null,
  channel public.communication_channel not null, recipient_address text not null, subject text, body text not null,
  message_type text not null default 'general', status public.delivery_status not null default 'pending',
  provider_message_id text, provider_status jsonb, error_message text, created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(), sent_at timestamptz
);
create index communication_logs_session_idx on public.communication_logs(session_id,created_at desc);
create index communication_logs_user_idx on public.communication_logs(user_id,created_at desc);
create unique index communication_provider_id_idx on public.communication_logs(provider_message_id) where provider_message_id is not null;

create table public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, body text not null, audience text not null default 'everyone',
  status public.content_status not null default 'draft', published_at timestamptz, created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.media_items (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null default '',
  media_type text not null check(media_type in ('photo','video','youtube','placeholder')), storage_path text, external_url text,
  event_date date, status public.content_status not null default 'draft', published_at timestamptz,
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null,
  entity_type text not null, entity_id text, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

create or replace function private.has_role(required_role public.app_role) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role=required_role)
$$;
create or replace function private.is_staff() returns boolean language sql stable security definer set search_path='' as $$
  select private.has_role('master_admin') or private.has_role('manager')
$$;
create or replace function private.my_instructor_id() returns uuid language sql stable security definer set search_path='' as $$
  select id from public.instructors where user_id=(select auth.uid()) limit 1
$$;
revoke all on all functions in schema private from public;
grant usage on schema private to authenticated, anon;
grant execute on function private.has_role(public.app_role), private.is_staff(), private.my_instructor_id() to authenticated;

create or replace function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['profiles','instructors','instructor_availability','class_types','class_sessions','registrations','communication_consents','announcements','media_items'] loop execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t); end loop; end $$;

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,full_name,email,phone) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'full_name',''),split_part(new.email,'@',1)),new.email,new.raw_user_meta_data->>'phone');
  insert into public.user_roles(user_id,role) values(new.id,'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create or replace function private.validate_session_availability() returns trigger language plpgsql set search_path='' as $$
begin
  if new.status in ('draft','published') and not exists(select 1 from public.instructor_availability a where a.instructor_id=new.instructor_id and a.starts_at<=new.starts_at and a.ends_at>=new.ends_at) then
    raise exception 'Class must fit inside submitted instructor availability.' using errcode='23514';
  end if;
  return new;
end $$;
create trigger validate_session_availability before insert or update of instructor_id,starts_at,ends_at,status on public.class_sessions for each row execute function private.validate_session_availability();

create or replace function public.register_for_session(p_session_id uuid) returns text language plpgsql security definer set search_path='' as $$
declare v_user uuid := auth.uid(); v_capacity integer; v_price integer; v_status public.session_status; v_confirmed integer; v_result public.registration_status; v_position integer;
begin
  if v_user is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  select capacity,price_cents,status into v_capacity,v_price,v_status from public.class_sessions where id=p_session_id and status='published' and starts_at>now() for update;
  if not found then raise exception 'Published class not found or booking has closed.'; end if;
  if exists(select 1 from public.registrations where session_id=p_session_id and user_id=v_user) then raise exception 'You are already registered for this class.' using errcode='23505'; end if;
  select count(*) into v_confirmed from public.registrations where session_id=p_session_id and status='confirmed';
  if v_confirmed < v_capacity then v_result:='confirmed'; v_position:=null; else v_result:='waitlisted'; select coalesce(max(waitlist_position),0)+1 into v_position from public.registrations where session_id=p_session_id and status='waitlisted'; end if;
  insert into public.registrations(session_id,user_id,status,waitlist_position,payment_status,amount_cents) values(p_session_id,v_user,v_result,v_position,case when v_price=0 then 'not_required'::public.payment_status else 'unpaid'::public.payment_status end,v_price);
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,details) values(v_user,'registration.created','class_session',p_session_id::text,jsonb_build_object('status',v_result));
  return v_result::text;
end $$;

create or replace function public.cancel_my_registration(p_registration_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_session uuid; v_status public.registration_status; v_start timestamptz; v_promote uuid;
begin
  select r.session_id,r.status,s.starts_at into v_session,v_status,v_start from public.registrations r join public.class_sessions s on s.id=r.session_id where r.id=p_registration_id and r.user_id=v_user for update;
  if not found then raise exception 'Registration not found.' using errcode='42501'; end if;
  if v_start <= now()+interval '2 hours' then raise exception 'Online cancellation closes two hours before class.'; end if;
  update public.registrations set status='cancelled',cancelled_at=now(),waitlist_position=null where id=p_registration_id;
  if v_status='confirmed' then
    select id into v_promote from public.registrations where session_id=v_session and status='waitlisted' order by waitlist_position,registered_at for update skip locked limit 1;
    if v_promote is not null then update public.registrations set status='confirmed',waitlist_position=null,promoted_at=now() where id=v_promote; end if;
    with ranked as (select id,row_number() over(order by waitlist_position,registered_at) pos from public.registrations where session_id=v_session and status='waitlisted') update public.registrations r set waitlist_position=ranked.pos from ranked where r.id=ranked.id;
  end if;
end $$;
revoke all on function public.register_for_session(uuid), public.cancel_my_registration(uuid) from public;
grant execute on function public.register_for_session(uuid), public.cancel_my_registration(uuid) to authenticated;

create or replace function public.manage_registration(p_registration_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare v_session uuid; v_capacity integer; v_confirmed integer; v_current public.registration_status;
begin
  if not private.is_staff() then raise exception 'Manager access required.' using errcode='42501'; end if;
  select r.session_id,r.status,s.capacity into v_session,v_current,v_capacity from public.registrations r join public.class_sessions s on s.id=r.session_id where r.id=p_registration_id for update of r,s;
  if not found then raise exception 'Registration not found.'; end if;
  if p_action='cancel' then update public.registrations set status='cancelled',cancelled_at=now(),waitlist_position=null where id=p_registration_id;
  elsif p_action='promote' then
    select count(*) into v_confirmed from public.registrations where session_id=v_session and status='confirmed';
    if v_current<>'waitlisted' then raise exception 'Only waitlisted registrations can be promoted.'; end if;
    if v_confirmed>=v_capacity then raise exception 'Class capacity is full.'; end if;
    update public.registrations set status='confirmed',waitlist_position=null,promoted_at=now() where id=p_registration_id;
  else raise exception 'Unsupported registration action.'; end if;
  with ranked as (select id,row_number() over(order by waitlist_position,registered_at) pos from public.registrations where session_id=v_session and status='waitlisted') update public.registrations r set waitlist_position=ranked.pos from ranked where r.id=ranked.id;
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,details) values(auth.uid(),'registration.'||p_action,'registration',p_registration_id::text,'{}');
end $$;
revoke all on function public.manage_registration(uuid,text) from public;
grant execute on function public.manage_registration(uuid,text) to authenticated;

alter table public.profiles enable row level security; alter table public.user_roles enable row level security; alter table public.instructors enable row level security;
alter table public.instructor_availability enable row level security; alter table public.class_types enable row level security; alter table public.class_sessions enable row level security;
alter table public.registrations enable row level security; alter table public.communication_consents enable row level security; alter table public.communication_logs enable row level security;
alter table public.announcements enable row level security; alter table public.media_items enable row level security; alter table public.audit_logs enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using(id=(select auth.uid()) or private.is_staff() or id in (select r.user_id from public.registrations r join public.class_sessions s on s.id=r.session_id where s.instructor_id=private.my_instructor_id()));
create policy profiles_self_update on public.profiles for update to authenticated using(id=(select auth.uid()) or private.is_staff()) with check(id=(select auth.uid()) or private.is_staff());
create policy roles_self_select on public.user_roles for select to authenticated using(user_id=(select auth.uid()) or private.is_staff());
create policy roles_admin_all on public.user_roles for all to authenticated using(private.has_role('master_admin')) with check(private.has_role('master_admin'));
create policy instructors_public_select on public.instructors for select to anon,authenticated using(active or private.is_staff() or user_id=(select auth.uid()));
create policy instructors_staff_all on public.instructors for all to authenticated using(private.is_staff()) with check(private.is_staff());
create policy availability_select on public.instructor_availability for select to authenticated using(private.is_staff() or instructor_id=private.my_instructor_id());
create policy availability_insert on public.instructor_availability for insert to authenticated with check(private.is_staff() or instructor_id=private.my_instructor_id());
create policy availability_update on public.instructor_availability for update to authenticated using(private.is_staff() or instructor_id=private.my_instructor_id()) with check(private.is_staff() or instructor_id=private.my_instructor_id());
create policy availability_delete on public.instructor_availability for delete to authenticated using(private.is_staff() or instructor_id=private.my_instructor_id());
create policy class_types_public_select on public.class_types for select to anon,authenticated using(active or private.is_staff());
create policy class_types_staff_all on public.class_types for all to authenticated using(private.is_staff()) with check(private.is_staff());
create policy sessions_public_select on public.class_sessions for select to anon,authenticated using(status='published' or private.is_staff() or instructor_id=private.my_instructor_id());
create policy sessions_staff_all on public.class_sessions for all to authenticated using(private.is_staff()) with check(private.is_staff() and created_by=(select auth.uid()));
create policy registrations_select on public.registrations for select to authenticated using(user_id=(select auth.uid()) or private.is_staff() or session_id in(select id from public.class_sessions where instructor_id=private.my_instructor_id()));
create policy registrations_staff_update on public.registrations for update to authenticated using(private.is_staff() or session_id in(select id from public.class_sessions where instructor_id=private.my_instructor_id() and exists(select 1 from public.instructors where id=private.my_instructor_id() and can_mark_attendance))) with check(user_id=user_id);
create policy consents_self_select on public.communication_consents for select to authenticated using(user_id=(select auth.uid()) or private.is_staff());
create policy consents_self_insert on public.communication_consents for insert to authenticated with check(user_id=(select auth.uid()) or private.is_staff());
create policy consents_self_update on public.communication_consents for update to authenticated using(user_id=(select auth.uid()) or private.is_staff()) with check(user_id=(select auth.uid()) or private.is_staff());
create policy communication_staff_all on public.communication_logs for all to authenticated using(private.is_staff()) with check(private.is_staff() and created_by=(select auth.uid()));
create policy communication_booking_insert on public.communication_logs for insert to authenticated with check(user_id=(select auth.uid()) and created_by=(select auth.uid()) and message_type='booking_confirmation');
create policy announcement_public_select on public.announcements for select to anon,authenticated using((status='published' and published_at<=now()) or private.is_staff());
create policy announcement_staff_all on public.announcements for all to authenticated using(private.is_staff()) with check(private.is_staff());
create policy media_public_select on public.media_items for select to anon,authenticated using((status='published' and published_at<=now()) or private.is_staff());
create policy media_staff_all on public.media_items for all to authenticated using(private.is_staff()) with check(private.is_staff());
create policy audit_admin_select on public.audit_logs for select to authenticated using(private.has_role('master_admin'));
create policy audit_staff_insert on public.audit_logs for insert to authenticated with check(actor_id=(select auth.uid()) and private.is_staff());

grant select on public.class_types,public.class_sessions,public.instructors,public.announcements,public.media_items to anon;
grant select,insert,update,delete on all tables in schema public to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']) on conflict(id) do nothing;
create policy media_storage_public_read on storage.objects for select to anon,authenticated using(bucket_id='media');
create policy media_storage_staff_insert on storage.objects for insert to authenticated with check(bucket_id='media' and private.is_staff());
create policy media_storage_staff_update on storage.objects for update to authenticated using(bucket_id='media' and private.is_staff()) with check(bucket_id='media' and private.is_staff());
create policy media_storage_staff_delete on storage.objects for delete to authenticated using(bucket_id='media' and private.is_staff());

create or replace function private.protect_registration_financials() returns trigger language plpgsql set search_path='' as $$
begin
  if not private.is_staff() and (new.payment_status is distinct from old.payment_status or new.amount_cents is distinct from old.amount_cents or new.user_id is distinct from old.user_id or new.session_id is distinct from old.session_id) then
    raise exception 'Only managers can change registration financial or ownership fields.' using errcode='42501';
  end if;
  return new;
end $$;
create trigger protect_registration_financials before update on public.registrations for each row execute function private.protect_registration_financials();

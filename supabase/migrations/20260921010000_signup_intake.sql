create table public.signup_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null,
  phone text not null,
  preferred_contact text not null check (preferred_contact in ('email','phone','text')),
  experience_level text not null check (experience_level in ('new','beginner','experienced')),
  notes text not null default '',
  status text not null default 'new' check (status in ('new','in_progress','account_created','completed','archived')),
  eballroom_username text,
  staff_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index signup_requests_status_created_idx on public.signup_requests(status,created_at desc);
alter table public.signup_requests enable row level security;

create policy signup_requests_staff_select on public.signup_requests for select to authenticated using(private.is_staff());
create policy signup_requests_staff_update on public.signup_requests for update to authenticated using(private.is_staff()) with check(private.is_staff());

grant select,update on public.signup_requests to authenticated;

create trigger touch_signup_requests_updated_at before update on public.signup_requests for each row execute function private.touch_updated_at();

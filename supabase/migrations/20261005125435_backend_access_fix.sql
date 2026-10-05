create schema if not exists extensions;
alter extension btree_gist set schema extensions;
revoke execute on function public.register_for_session(uuid), public.cancel_my_registration(uuid), public.manage_registration(uuid,text) from anon;
grant execute on function private.is_staff(), private.my_instructor_id() to anon;

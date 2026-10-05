create or replace function public.move_instructor(p_id uuid,p_direction text)
returns void language plpgsql security invoker set search_path='' as $$
declare ids uuid[]; pos integer; target integer; temp uuid;
begin
 if auth.uid() is null or not private.is_staff() then raise exception 'Manager access required.' using errcode='42501'; end if;
 if p_direction not in ('up','down') then raise exception 'Invalid direction.'; end if;
 perform pg_advisory_xact_lock(71630501);
 perform id from public.instructors order by sort_order,created_at,id for update;
 select array_agg(id order by sort_order,created_at,id) into ids from public.instructors;
 pos:=array_position(ids,p_id);
 if pos is null then raise exception 'Instructor not found.'; end if;
 target:=pos+case when p_direction='up' then -1 else 1 end;
 if target<1 or target>array_length(ids,1) then return; end if;
 temp:=ids[target];ids[target]:=ids[pos];ids[pos]:=temp;
 update public.instructors i set sort_order=ordered.position-1
 from unnest(ids) with ordinality as ordered(id,position) where i.id=ordered.id;
end $$;
revoke all on function public.move_instructor(uuid,text) from public,anon;
grant execute on function public.move_instructor(uuid,text) to authenticated;

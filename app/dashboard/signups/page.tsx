import { PageHeading } from "@/components/page-heading";
import { requireViewer, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateSignup } from "./actions";

export default async function SignupRequestsPage() {
  const viewer = await requireViewer();
  if (!isStaff(viewer.roles)) return <div className="empty">Administrator access required.</div>;
  const db = (await createClient())!;
  const { data } = await db.from("signup_requests").select("*").order("created_at",{ascending:false});
  return <><PageHeading title="New signups" description="Customer information waiting to be entered into eBallroom."/><div className="grid gap-4">{data?.map((row:any)=><article className="panel p-5" key={row.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="western text-2xl font-bold">{row.full_name}</h2><p className="mt-1 text-sm text-[var(--muted)]"><a href={`mailto:${row.email}`}>{row.email}</a> · <a href={`tel:${row.phone}`}>{row.phone}</a></p><p className="mt-2 text-sm">Prefers {row.preferred_contact} · {row.experience_level} dancer</p>{row.notes&&<p className="mt-3 text-sm text-[var(--muted)]">{row.notes}</p>}</div><span className="tag">{row.status.replaceAll("_"," ")}</span></div><form action={updateSignup} className="mt-5 grid gap-3 border-t border-[var(--line)] pt-4 md:grid-cols-3"><input type="hidden" name="id" value={row.id}/><div className="field"><label>Status</label><select name="status" defaultValue={row.status}><option value="new">New</option><option value="in_progress">In progress</option><option value="account_created">Account created</option><option value="completed">Completed</option><option value="archived">Archived</option></select></div><div className="field"><label>eBallroom username</label><input name="eballroom_username" defaultValue={row.eballroom_username||""}/></div><div className="field"><label>Staff notes</label><input name="staff_notes" defaultValue={row.staff_notes||""}/></div><button className="btn btn-primary md:col-start-3">Save</button></form></article>)}{!data?.length&&<div className="empty">No signup requests yet.</div>}</div></>;
}

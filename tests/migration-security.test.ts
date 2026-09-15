import {readFileSync,readdirSync} from "node:fs"; import {join} from "node:path"; import {describe,expect,it} from "vitest";
const dir=join(process.cwd(),"supabase/migrations");const sql=readdirSync(dir).filter(x=>x.endsWith(".sql")).map(x=>readFileSync(join(dir,x),"utf8")).join("\n");
describe("production migration",()=>{
  it.each(["profiles","user_roles","instructors","instructor_availability","class_types","class_sessions","registrations","communication_consents","communication_logs","announcements","media_items","audit_logs"])("enables RLS on %s",table=>expect(sql).toContain(`alter table public.${table} enable row level security`));
  it("enforces duplicate registrations",()=>expect(sql).toContain("unique(session_id,user_id)"));
  it("serializes capacity and waitlist decisions",()=>{expect(sql).toContain("for update");expect(sql).toContain("v_result:='waitlisted'");});
  it("promotes the next waitlisted student",()=>expect(sql).toContain("status='confirmed',waitlist_position=null,promoted_at=now()"));
  it("enforces instructor overlap and availability",()=>{expect(sql).toContain("exclude using gist");expect(sql).toContain("validate_session_availability");});
  it("protects financial fields",()=>expect(sql).toContain("protect_registration_financials"));
});

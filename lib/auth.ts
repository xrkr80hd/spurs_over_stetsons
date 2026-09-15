import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

export async function getViewer() {
  const supabase=await createClient();
  if (!supabase) return null;
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return null;
  const {data:profile}=await supabase.from("profiles").select("id,full_name,email,phone,sms_opted_out_at").eq("id",user.id).single();
  const {data:roles}=await supabase.from("user_roles").select("role").eq("user_id",user.id);
  return { user, profile, roles:(roles?.map(r=>r.role) || []) as AppRole[] };
}

export async function requireViewer() { const viewer=await getViewer(); if(!viewer) redirect("/login"); return viewer; }
export function isStaff(roles:AppRole[]) { return roles.includes("master_admin") || roles.includes("manager"); }

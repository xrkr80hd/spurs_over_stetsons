"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateSignup(formData: FormData) {
  const viewer = await requireViewer();
  if (!isStaff(viewer.roles)) throw new Error("Administrator access required.");
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(["new","in_progress","account_created","completed","archived"]).parse(formData.get("status"));
  const eballroom_username = String(formData.get("eballroom_username") || "").trim();
  const staff_notes = String(formData.get("staff_notes") || "").trim();
  const db = (await createClient())!;
  const { error } = await db.from("signup_requests").update({status,eballroom_username:eballroom_username||null,staff_notes,completed_at:status==="completed"?new Date().toISOString():null}).eq("id",id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/signups");
}

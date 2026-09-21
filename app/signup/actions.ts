"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export type SignupState = { success?: boolean; error?: string };
const schema = z.object({
  full_name: z.string().trim().min(2,"Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().min(7,"Please enter a valid phone number.").max(30),
  preferred_contact: z.enum(["email","phone","text"]),
  experience_level: z.enum(["new","beginner","experienced"]),
  notes: z.string().trim().max(1000).optional(),
});

export async function submitSignup(_: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Please check your information." };
  try {
    const db = createAdminClient();
    const { error } = await db.from("signup_requests").insert(parsed.data);
    if (error) throw error;
    return { success: true };
  } catch {
    return { error: "We could not save your signup right now. Please try again or email spursoverstetsonsla@gmail.com." };
  }
}

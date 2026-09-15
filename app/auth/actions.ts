"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState={error?:string;success?:string};
export async function signIn(_:AuthState,formData:FormData):Promise<AuthState>{const supabase=await createClient();if(!supabase)return {error:"Supabase is not configured."};const email=String(formData.get("email")||"");const password=String(formData.get("password")||"");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)return {error:error.message};redirect("/dashboard");}
export async function signUp(_:AuthState,formData:FormData):Promise<AuthState>{const supabase=await createClient();if(!supabase)return {error:"Supabase is not configured."};const full_name=String(formData.get("full_name")||"");const email=String(formData.get("email")||"");const phone=String(formData.get("phone")||"");const password=String(formData.get("password")||"");const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name,phone},emailRedirectTo:`${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/auth/callback`}});if(error)return {error:error.message};return {success:"Check your email to confirm your account."};}
export async function signOut(){const supabase=await createClient();if(supabase)await supabase.auth.signOut();redirect("/");}

import { createClient } from "@/lib/supabase/server";

export async function publishedSessions() {
  const supabase=await createClient(); if(!supabase) return [];
  const {data}=await supabase.from("class_sessions").select("id,starts_at,ends_at,capacity,price_cents,status,location,class_types(name,level),instructors(id,public_name),registrations(id,status)").eq("status","published").gte("starts_at",new Date().toISOString()).order("starts_at");
  return data || [];
}

export async function publicInstructors() {
  const supabase=await createClient(); if(!supabase) return [];
  const {data}=await supabase.from("instructors").select("id,public_name,bio,dance_styles").eq("active",true).order("created_at");
  return data || [];
}

export async function publicMedia() {
  const supabase=await createClient(); if(!supabase) return [];
  const {data}=await supabase.from("media_items").select("id,title,description,media_type,storage_path,external_url,published_at,event_date").eq("status","published").lte("published_at",new Date().toISOString()).order("published_at",{ascending:false});
  return data || [];
}

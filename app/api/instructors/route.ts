import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth";
import type { AppRole } from "@/lib/types";
const fields = z.object({public_name:z.string().trim().min(2).max(120),bio:z.string().trim().max(10000),sort_order:z.coerce.number().int().min(0).max(9999),active:z.enum(["true","false"])});
export async function POST(req:Request) {
 const db=await createClient();
 if(!db)return NextResponse.json({error:"Database is unavailable."},{status:503});
 const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"Please sign in."},{status:401});
 const {data:roles}=await db.from("user_roles").select("role").eq("user_id",user.id);
 if(!isStaff((roles?.map(r=>r.role)||[]) as AppRole[]))return NextResponse.json({error:"Manager access required."},{status:403});
 const fd=await req.formData();const rawId=fd.get("id");const id=rawId?z.string().uuid().safeParse(rawId):null;
 if(id&&!id.success)return NextResponse.json({error:"Invalid instructor."},{status:400});
 const instructorId=id?.success?id.data:null;
 let previous: {photo_path:string|null;photo_url:string|null;photo_width:number;photo_height:number;photo_crop:number[]|null}|null=null;
 if(instructorId){const {data,error}=await db.from("instructors").select("photo_path,photo_url,photo_width,photo_height,photo_crop").eq("id",instructorId).single();if(error||!data)return NextResponse.json({error:"Instructor not found."},{status:404});previous=data;}
 if(fd.get("action")==="delete"){
  if(!instructorId)return NextResponse.json({error:"Instructor not found."},{status:400});
  const {error}=await db.from("instructors").delete().eq("id",instructorId).select("id").single();
  if(error)return NextResponse.json({error:error.code==="23503"?"This instructor is assigned to classes. Hide their card instead, or reassign those classes before deleting.":error.message},{status:400});
  if(previous?.photo_path)await db.storage.from("instructor-photos").remove([previous.photo_path]);
 }else{
  const parsed=fields.safeParse(Object.fromEntries(fd));if(!parsed.success)return NextResponse.json({error:"Enter a name, bio, and valid display order."},{status:400});
  const file=fd.get("photo");let path:string|null=null;
  let photo={photo_url:previous?.photo_url||null,photo_path:previous?.photo_path||null,photo_width:previous?.photo_width||1200,photo_height:previous?.photo_height||1600,photo_crop:previous?.photo_crop||null};
  if(file instanceof File&&file.size){
   const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
   if(!extensions[file.type]||file.size>4*1024*1024)return NextResponse.json({error:"Choose a JPG, PNG, or WebP photo under 4 MB."},{status:400});
   const dimensions=z.object({width:z.coerce.number().int().positive().max(30000),height:z.coerce.number().int().positive().max(30000)}).safeParse({width:fd.get("width"),height:fd.get("height")});
   if(!dimensions.success)return NextResponse.json({error:"Unable to read photo dimensions."},{status:400});
   path=`${crypto.randomUUID()}.${extensions[file.type]}`;
   const {error}=await db.storage.from("instructor-photos").upload(path,file,{contentType:file.type});if(error)return NextResponse.json({error:error.message},{status:400});
   photo={photo_url:db.storage.from("instructor-photos").getPublicUrl(path).data.publicUrl,photo_path:path,photo_width:dimensions.data.width,photo_height:dimensions.data.height,photo_crop:null};
  }
  if(!photo.photo_url)return NextResponse.json({error:"Choose an instructor photo."},{status:400});
  const row={...parsed.data,active:parsed.data.active==="true",...photo};
  const operation=instructorId?db.from("instructors").update(row).eq("id",instructorId):db.from("instructors").insert(row);
  const {error}=await operation.select("id").single();
  if(error){if(path)await db.storage.from("instructor-photos").remove([path]);return NextResponse.json({error:error.message},{status:400});}
  if(path&&previous?.photo_path)await db.storage.from("instructor-photos").remove([previous.photo_path]);
 }
 revalidatePath("/");revalidatePath("/dashboard/instructors");
 return NextResponse.json({ok:true});
}

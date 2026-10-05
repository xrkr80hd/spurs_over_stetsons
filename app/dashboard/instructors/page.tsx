import { PageHeading } from "@/components/page-heading";
import { requireViewer, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InstructorManager } from "@/components/instructor-manager";
export default async function Page() {
 const viewer=await requireViewer();if(!isStaff(viewer.roles))redirect("/dashboard");
 const db=(await createClient())!;
 const {data,error}=await db.from("instructors").select("id,public_name,bio,photo_url,active,sort_order").order("sort_order").order("created_at");
 return <><PageHeading title="Instructor media" description="Add photos and biographies to the website carousel. Expand an instructor’s name to edit or delete their card."/>{error?<p role="alert" className="empty">Unable to load instructors. Please try again.</p>:<InstructorManager instructors={data||[]}/>}</>;
}

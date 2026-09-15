import { PageHeading } from "@/components/page-heading";
import { requireViewer, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveInstructor } from "../actions";
export default async function Page() {
  const viewer = await requireViewer();
  if (!isStaff(viewer.roles)) redirect("/dashboard");
  const db = (await createClient())!;
  const { data } = await db
    .from("instructors")
    .select("id,active,bio,dance_styles,profiles(full_name,email,phone)")
    .order("created_at");
  return (
    <>
      <PageHeading
        title="Instructors"
        description="Instructor records are linked to real authenticated users and scoped by RLS."
      />
      <div className="panel table-wrap p-4">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Styles</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data as any[] | null)?.map((i) => (
              <tr key={i.id}>
                <td>{i.profiles?.full_name}</td>
                <td>
                  {i.profiles?.email}
                  <br />
                  {i.profiles?.phone}
                </td>
                <td>
                  <form action={saveInstructor} className="grid min-w-64 gap-2">
                    <input type="hidden" name="instructor_id" value={i.id} />
                    <input name="dance_styles" defaultValue={i.dance_styles?.join(", ")} aria-label="Dance styles" />
                    <textarea name="bio" defaultValue={i.bio} aria-label="Instructor bio" />
                    <select name="active" defaultValue={String(i.active)} aria-label="Status">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    <button className="btn">Save instructor</button>
                  </form>
                </td>
                <td>
                  <span className="tag">
                    {i.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && (
          <div className="empty">
            Create an Auth user, assign the instructor role, then add the
            instructor record.
          </div>
        )}
      </div>
    </>
  );
}

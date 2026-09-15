import { redirect } from "next/navigation";
import { PageHeading } from "@/components/page-heading";
import { requireViewer, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CommunicationForm } from "@/components/communication-form";
export default async function Page() {
  const viewer = await requireViewer();
  if (!isStaff(viewer.roles)) redirect("/dashboard");
  const db = (await createClient())!;
  const [{ data: sessions }, { data: logs }, { data: roster }] = await Promise.all([
    db
      .from("class_sessions")
      .select("id,starts_at,class_types(name)")
      .order("starts_at", { ascending: false })
      .limit(50),
    db
      .from("communication_logs")
      .select(
        "id,channel,recipient_address,subject,status,provider_message_id,error_message,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("registrations")
      .select("id,session_id,status,profiles(full_name,email,phone)")
      .in("status", ["confirmed", "waitlisted"])
      .order("registered_at", { ascending: false }),
  ]);
  return (
    <>
      <PageHeading
        title="Communication center"
        description="Email or text one student, selected students, or an eligible class roster."
      />
      <CommunicationForm sessions={(sessions || []) as any[]} roster={(roster || []) as any[]} />
      <div className="panel table-wrap mt-5 p-4">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Channel</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((x) => (
              <tr key={x.id}>
                <td>{new Date(x.created_at).toLocaleString()}</td>
                <td>{x.channel}</td>
                <td>{x.recipient_address}</td>
                <td>{x.subject || "—"}</td>
                <td>
                  <span className="tag">{x.status}</span>
                  {x.error_message && (
                    <p className="mt-1 text-xs text-red-300">
                      {x.error_message}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

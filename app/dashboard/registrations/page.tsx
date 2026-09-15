import { PageHeading } from "@/components/page-heading";
import { requireViewer, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { manageRegistration, setAttendance } from "../actions";
export default async function Page() {
  const viewer = await requireViewer();
  const db = (await createClient())!;
  const staff = isStaff(viewer.roles);
  const { data } = await db
    .from("registrations")
    .select(
      "id,status,attendance_status,registered_at,waitlist_position,payment_status,amount_cents,profiles(full_name,email,phone),class_sessions(id,starts_at,class_types(name),instructors(user_id))",
    )
    .order("registered_at", { ascending: false });
  return (
    <>
      <PageHeading
        title={staff ? "Class rosters" : "My assigned rosters"}
        description={
          staff
            ? "Confirmed students, waitlists, contact eligibility, payment state, and attendance."
            : "Only rosters for your assigned classes are available."
        }
      />
      <div className="panel table-wrap p-4">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Attendance / actions</th>
            </tr>
          </thead>
          <tbody>
            {(data as any[] | null)?.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.profiles?.full_name}</strong>
                  <br />
                  <span className="text-xs text-[var(--muted)]">
                    {r.profiles?.email}
                    <br />
                    {r.profiles?.phone}
                  </span>
                </td>
                <td>
                  {r.class_sessions?.class_types?.name}
                  <br />
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(r.class_sessions?.starts_at).toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className="tag">
                    {r.status}
                    {r.waitlist_position ? ` #${r.waitlist_position}` : ""}
                  </span>
                </td>
                <td>
                  {r.payment_status}
                  <br />
                  {(r.amount_cents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
                <td>
                  {r.status === "confirmed" ? (
                    <form action={setAttendance} className="flex gap-2">
                      <input
                        type="hidden"
                        name="registration_id"
                        value={r.id}
                      />
                      <select
                        name="attendance_status"
                        defaultValue={r.attendance_status}
                        className="rounded-lg border border-[var(--line)] bg-[#211b17] p-2"
                      >
                        <option value="unmarked">Unmarked</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </select>
                      <button className="btn">Save</button>
                    </form>
                  ) : (
                    "—"
                  )}
                  {staff && r.status !== "cancelled" && (
                    <div className="mt-2 flex gap-2">
                      {r.status === "waitlisted" && (
                        <form action={manageRegistration}>
                          <input type="hidden" name="registration_id" value={r.id} />
                          <input type="hidden" name="action" value="promote" />
                          <button className="btn">Promote</button>
                        </form>
                      )}
                      <form action={manageRegistration}>
                        <input type="hidden" name="registration_id" value={r.id} />
                        <input type="hidden" name="action" value="cancel" />
                        <button className="btn btn-danger">Cancel</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && (
          <div className="empty">
            No registrations are visible to this account.
          </div>
        )}
      </div>
    </>
  );
}

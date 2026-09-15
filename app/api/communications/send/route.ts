import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth";
import { sendEmail } from "@/lib/providers/email";
import { sendSms } from "@/lib/providers/sms";
const bodySchema = z.object({
  sessionId: z.string().uuid(),
  channel: z.enum(["email", "sms", "both"]),
  audience: z.enum(["eligible_roster", "confirmed", "waitlisted", "selected"]),
  recipientIds: z.array(z.string().uuid()).max(100).default([]),
  messageType: z.enum([
    "general",
    "schedule_change",
    "cancellation",
    "reminder",
  ]),
  subject: z.string().min(1).max(160),
  message: z.string().min(1).max(1600),
});
export async function POST(req: Request) {
  const db = await createClient();
  if (!db)
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: roles } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  if (!isStaff((roles?.map((x) => x.role) || []) as any))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid message request." },
      { status: 400 },
    );
  const b = parsed.data;
  let query = db
    .from("registrations")
    .select(
      "id,user_id,status,profiles(full_name,email,phone,sms_opted_out_at),communication_consents(channel,status)",
    )
    .eq("session_id", b.sessionId);
  if (b.audience === "selected") {
    if (!b.recipientIds.length) return NextResponse.json({error:"Choose at least one student."},{status:400});
    query = query.in("id",b.recipientIds);
  } else if (b.audience !== "eligible_roster")
    query = query.eq(
      "status",
      b.audience === "confirmed" ? "confirmed" : "waitlisted",
    );
  else query = query.in("status", ["confirmed", "waitlisted"]);
  const { data: recipients, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  let sent = 0,
    failed = 0;
  for (const r of recipients || []) {
    const channels = b.channel === "both" ? ["email", "sms"] : [b.channel];
    for (const channel of channels) {
      const profile = r.profiles as any;
      if (!profile) {
        failed++;
        continue;
      }
      const eligible =
        channel === "email"
          ? Boolean(profile.email)
          : Boolean(
              profile.phone &&
              !profile.sms_opted_out_at &&
              r.communication_consents?.some(
                (c) => c.channel === "sms" && c.status === "opted_in",
              ),
            );
      if (!eligible) continue;
      const address = channel === "email" ? profile.email! : profile.phone!;
      const log = {
        session_id: b.sessionId,
        registration_id: r.id,
        user_id: r.user_id,
        channel,
        recipient_address: address,
        subject: channel === "email" ? b.subject : null,
        body: b.message,
        message_type: b.messageType,
        status: "pending",
        created_by: user.id,
      };
      const { data: created } = await db
        .from("communication_logs")
        .insert(log)
        .select("id")
        .single();
      if (!created) {
        failed++;
        continue;
      }
      const result =
        channel === "email"
          ? await sendEmail({
              to: address,
              subject: b.subject,
              message: b.message,
              idempotencyKey: `communication-${created.id}`,
            })
          : await sendSms({ to: address, message: b.message });
      await db
        .from("communication_logs")
        .update({
          status: result.ok ? "sent" : "failed",
          provider_message_id: result.providerId || null,
          error_message: result.error || null,
          sent_at: result.ok ? new Date().toISOString() : null,
        })
        .eq("id", created.id);
      if (result.ok) {
        sent++;
      } else {
        failed++;
      }
    }
  }
  return NextResponse.json({ sent, failed });
}

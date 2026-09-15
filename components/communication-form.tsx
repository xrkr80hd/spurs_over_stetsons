"use client";
import { useState } from "react";
export function CommunicationForm({
  sessions,
  roster,
}: {
  sessions: {
    id: string;
    starts_at: string;
    class_types: { name: string } | null;
  }[];
  roster: { id:string; session_id:string; status:string; profiles:{full_name:string;email:string;phone:string|null}|null }[];
}) {
  const [result, setResult] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult("Sending…");
    const form = new FormData(e.currentTarget);
    const body = {...Object.fromEntries(form), recipientIds:form.getAll("recipientIds")};
    const res = await fetch("/api/communications/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setResult(
      res.ok
        ? `${json.sent} sent, ${json.failed} failed`
        : json.error || "Send failed",
    );
  }
  return (
    <form onSubmit={submit} className="panel grid gap-4 p-5 md:grid-cols-2">
      <div className="field">
        <label>Class roster</label>
        <select name="sessionId" required>
          <option value="">Choose class</option>
          {sessions.map((x) => (
            <option key={x.id} value={x.id}>
              {x.class_types?.name} — {new Date(x.starts_at).toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Channel</label>
        <select name="channel">
          <option value="email">Email</option>
          <option value="sms">SMS (eligible/consented only)</option>
          <option value="both">Email + SMS</option>
        </select>
      </div>
      <div className="field">
        <label>Recipients</label>
        <select name="audience">
          <option value="eligible_roster">Full eligible roster</option>
          <option value="confirmed">Confirmed only</option>
          <option value="waitlisted">Waitlist only</option>
          <option value="selected">Selected students below</option>
        </select>
      </div>
      <div className="field">
        <label>Message type</label>
        <select name="messageType">
          <option value="general">General</option>
          <option value="schedule_change">Schedule change</option>
          <option value="cancellation">Cancellation</option>
          <option value="reminder">Reminder</option>
        </select>
      </div>
      <div className="field md:col-span-2">
        <label>Optional selected students (Ctrl/Cmd-click for more than one)</label>
        <select name="recipientIds" multiple size={Math.min(8,Math.max(3,roster.length))}>
          {roster.map((r)=><option key={r.id} value={r.id}>{r.profiles?.full_name} — {r.profiles?.email} — {r.status}</option>)}
        </select>
      </div>
      <div className="field md:col-span-2">
        <label>Subject</label>
        <input name="subject" required />
      </div>
      <div className="field md:col-span-2">
        <label>Message</label>
        <textarea name="message" rows={5} required />
      </div>
      <button className="btn btn-primary md:col-span-2">Send message</button>
      {result && (
        <p className="md:col-span-2" aria-live="polite">
          {result}
        </p>
      )}
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("send failed");
      event.currentTarget.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block"><span className="mb-2 block text-sm font-bold">Your Name</span><input name="name" required maxLength={100} placeholder="Name" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent2)]" /></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Your Email</span><input name="email" type="email" required maxLength={200} placeholder="you@example.com" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent2)]" /></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Message</span><textarea name="message" required maxLength={5000} rows={7} placeholder="How can we help?" className="w-full resize-y rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent2)]" /></label>
      <button disabled={status === "sending"} type="submit" className="w-full rounded-xl bg-[var(--accent2)] px-6 py-3 font-bold text-black disabled:opacity-60">{status === "sending" ? "Sending…" : "Send Message"}</button>
      {status === "sent" && <p role="status" className="font-semibold">Thanks! Your message has been sent.</p>}
      {status === "error" && <p role="alert" className="font-semibold">We couldn’t send your message. Please call or email us directly.</p>}
    </form>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Spurs Over Stetsons Dance Hall in Alexandria, Louisiana.",
};

const mapUrl = "https://www.google.com/maps/search/?api=1&query=3923+Independence+Dr+Alexandria+LA+71303";

export default function ContactPage() {
  return (
    <section className="wrap py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent2)]">Spurs Over Stetsons Dance Hall</p>
        <h1 className="western my-4 text-5xl font-bold sm:text-6xl">Contact Us</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">Questions about classes, events, private lessons, or the dance hall? Get in touch with Anthony &amp; Marle Chapman.</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[.04] p-6 sm:p-8">
            <h2 className="western text-3xl font-bold">Anthony &amp; Marle Chapman</h2>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[.16em] text-[var(--accent2)]">Owners</p>
            <div className="mt-8 space-y-5 text-lg">
              <p><span className="block text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Phone</span><a className="font-semibold hover:underline" href="tel:+13187877880">318-787-7880</a></p>
              <p><span className="block text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Email</span><a className="break-all font-semibold hover:underline" href="mailto:info@spursoverstetsons.com">info@spursoverstetsons.com</a></p>
              <p><span className="block text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Address</span><a className="font-semibold hover:underline" href={mapUrl} target="_blank" rel="noreferrer">3923 Independence Dr.<br />Alexandria, LA 71303</a></p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="tel:+13187877880" className="rounded-full bg-[var(--accent2)] px-6 py-3 font-bold text-black">Call Us</a>
              <a href="mailto:info@spursoverstetsons.com" className="rounded-full border border-white/20 px-6 py-3 font-bold">Email Us</a>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-6 py-3 font-bold">Get Directions</a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[.04] p-6 sm:p-8">
            <h2 className="western text-3xl font-bold">Send Us a Message</h2>
            <p className="mt-2 text-[var(--muted)]">This opens your email app with the details ready to send.</p>
            <form action="mailto:info@spursoverstetsons.com" method="get" className="mt-6 space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-bold">Your Name</span><input name="subject" required placeholder="Name" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent2)]" /></label>
              <label className="block"><span className="mb-2 block text-sm font-bold">Message</span><textarea name="body" required rows={7} placeholder="How can we help?" className="w-full resize-y rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[var(--accent2)]" /></label>
              <button type="submit" className="w-full rounded-xl bg-[var(--accent2)] px-6 py-3 font-bold text-black">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

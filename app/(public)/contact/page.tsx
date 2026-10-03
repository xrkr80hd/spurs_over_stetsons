import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

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
            <p className="mt-2 text-[var(--muted)]">Have a question? Send us a message and we’ll get back to you.</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

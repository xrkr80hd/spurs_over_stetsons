import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Classes" };

export default function ComingSoonPage() {
  return (
    <section className="coming-page">
      <p className="landing-eyebrow">COMING SOON</p>
      <h1>Classes are on the way.</h1>
      <p>We&apos;re preparing everything now. Check back soon for updates from Spurs Over Stetsons.</p>
      <Link href="/" className="landing-action">Back Home <span aria-hidden="true">→</span></Link>
    </section>
  );
}

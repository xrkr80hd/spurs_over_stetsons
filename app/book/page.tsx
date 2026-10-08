import Link from "next/link";
import { redirect } from "next/navigation";
import { getEBallroomClassBookingLink } from "@/lib/eballroom-booking";
import styles from "./page.module.css";

export const metadata = { title: "Book a Class | Spurs Over Stetsons" };

export default async function BookingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? (params[key] as string).slice(0, 300) : "";
  const classId = value("classId");
  const title = value("title");
  const date = value("date");
  const time = value("time");

  // eBallroom owns authentication and checkout. Send directly to an actual
  // class-specific link only when the studio has explicitly configured one.
  const directLink = getEBallroomClassBookingLink(classId);
  if (directLink) redirect(directLink);

  return <main className={styles.page}>
    <Link href="/#calendar" className={styles.back}>← Back to the calendar</Link>
    <p className="landing-eyebrow">SPURS OVER STETSONS</p>
    <h1>Let’s get you dancing.</h1>
    {title && <section className={styles.selection} aria-label="Selected class">
      <span>Your selected class</span><h2>{title}</h2>
      <p>{date}{time ? " · " + time + " Central" : ""}</p>
    </section>}
    <p className={styles.intro}>Continue to eBallroom to sign in or create your account.</p>
    <div className={styles.choices}>
      <section className={styles.card}>
        <h2>Already a student?</h2>
        <p>Sign in to your existing eBallroom account.</p>
        <a className="landing-action" href="https://my.e-ballroom.com/">Log in to eBallroom <span aria-hidden="true">↗</span></a>
      </section>
      <section className={styles.card}>
        <h2>New student?</h2>
        <p>Create your eBallroom account to get started.</p>
        <a className="landing-action" href="https://my.e-ballroom.com/register?studio=4b9f0d88-9edc-4390-8998-93937355999e">Create an Account <span aria-hidden="true">↗</span></a>
      </section>
    </div>
    <p className={styles.note}>Direct checkout for this class is not connected yet. You will need to select your class in eBallroom after signing in. Booking and payment are confirmed by eBallroom, not by selecting the class on this website.</p>
  </main>;
}

import Link from "next/link";
import styles from "./page.module.css";

export const metadata = { title: "Book a Class | Spurs Over Stetsons" };

export default async function BookingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? (params[key] as string).slice(0, 300) : "";
  const title = value("title");
  const date = value("date");
  const time = value("time");
  return <main className={styles.page}>
    <Link href="/#calendar" className={styles.back}>← Back to the calendar</Link>
    <p className="landing-eyebrow">SPURS OVER STETSONS</p>
    <h1>Let’s get you dancing.</h1>
    {title && <section className={styles.selection} aria-label="Selected class">
      <span>Your selected class</span><h2>{title}</h2>
      <p>{date}{time ? " · " + time + " Central" : ""}</p>
    </section>}
    <p className={styles.intro}>Choose how you’d like to continue.</p>
    <div className={styles.choices}>
      <section className={styles.card}>
        <h2>Already a member?</h2>
        <p>Use your existing eBallroom account to book your class.</p>
        <a className="landing-action" href="https://my.e-ballroom.com/login">Members Login <span aria-hidden="true">↗</span></a>
      </section>
      <section className={styles.card}>
        <h2>Not a Member?</h2>
        <p>Create your account to start taking lessons with us.</p>
        <a className="landing-action" href="https://my.e-ballroom.com/register?studio=4b9f0d88-9edc-4390-8998-93937355999e">Create an Account! <span aria-hidden="true">↗</span></a>
      </section>
    </div>
    <p className={styles.note}>After logging in or creating your account, select this class in eBallroom and confirm your booking. Your spot is reserved once that booking is confirmed.</p>
  </main>;
}

import Image from "next/image";
import Link from "next/link";

const CONTACT_EMAIL = "spursoverstetsonsla@gmail.com";

export default function HomePage() {
  return (
    <>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow">ALEXANDRIA, LOUISIANA</p>
          <h1>Your dance floor<br /><em>is coming.</em></h1>
          <p className="landing-intro">Spurs Over Stetsons is bringing country dance instruction and welcoming dance-floor experiences to Alexandria.</p>
          <a className="landing-action" href={`mailto:${CONTACT_EMAIL}?subject=Spurs%20Over%20Stetsons%20Interest`}>
            Stay in the Loop <span aria-hidden="true">→</span>
          </a>
          <small>Class schedules, instructors, and registration details will be announced soon.</small>
        </div>
        <div className="landing-image" role="img" aria-label="Warm country dance hall" />
      </section>

      <section className="landing-offer">
        <p className="landing-eyebrow">WHAT&apos;S AHEAD</p>
        <h2>Built for beginners.<br />Made for the dance floor.</h2>
        <div className="landing-cards">
          <article><span>01</span><h3>Learn the Steps</h3><p>Comfortable instruction designed to help every dancer build confidence.</p></article>
          <article><span>02</span><h3>Meet on the Floor</h3><p>A welcoming place to learn, practice, and enjoy country dancing together.</p></article>
          <article><span>03</span><h3>Keep Dancing</h3><p>Upcoming classes and dance opportunities will be shared right here.</p></article>
        </div>
      </section>

      <section className="landing-coming" id="coming-soon">
        <Image src="/spurs-over-stetsons-logo.webp" alt="" aria-hidden="true" width={720} height={720} />
        <div>
          <p className="landing-eyebrow">COMING SOON</p>
          <h2>Instructors and classes are on the way.</h2>
          <p>We&apos;re preparing the schedule and registration experience now. Check back soon, or contact us to receive an update.</p>
        </div>
        <a className="landing-action" href={`mailto:${CONTACT_EMAIL}?subject=Spurs%20Over%20Stetsons%20Update`}>Request an Update <span aria-hidden="true">→</span></a>
      </section>
    </>
  );
}

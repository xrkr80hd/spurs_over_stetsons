import Image from "next/image";
const REGISTRATION_URL = "https://my.e-ballroom.com/register?studio=4b9f0d88-9edc-4390-8998-93937355999e";
const LOGIN_URL = "https://my.e-ballroom.com/login";

export default function HomePage() {
  return <>
    <section className="landing-hero">
      <div className="landing-copy">
        <p className="landing-eyebrow">ALEXANDRIA, LOUISIANA</p>
        <h1>Let&apos;s<br/><em>dance.</em></h1>
        <p className="landing-intro">Country dance lessons and a welcoming dance-floor experience for beginners, seasoned dancers, and everyone in between.</p>
        <div className="landing-actions">
          <a className="landing-action" href={REGISTRATION_URL} target="_blank" rel="noreferrer">Sign Up <span aria-hidden="true">→</span></a>
          <a className="landing-secondary" href={LOGIN_URL} target="_blank" rel="noreferrer">Login ↗</a>
        </div>
        <small>Create your account to get started. Then return anytime to log in.</small>
      </div>
      <div className="landing-image" role="img" aria-label="Warm country dance hall"/>
    </section>
    <section className="landing-offer">
      <p className="landing-eyebrow">SPURS OVER STETSONS</p>
      <h2>Confidence in every step.<br/>Good times on every floor.</h2>
      <div className="landing-cards">
        <article><span>01</span><h3>Dance Lessons</h3><p>Learn the steps, build confidence, and move at a pace that feels right for you.</p></article>
        <article><span>02</span><h3>Group Classes</h3><p>Practice with others in a welcoming space made for learning and having fun.</p></article>
        <article><span>03</span><h3>Dance Events</h3><p>Put your skills to work, meet new people, and enjoy the dance floor.</p></article>
      </div>
    </section>
    <section className="landing-coming">
      <Image src="/spurs-over-stetsons-logo.webp" alt="" aria-hidden="true" width={720} height={720}/>
      <div><p className="landing-eyebrow">GET STARTED</p><h2>Ready to join us?</h2><p>Create your account and take your first step onto the dance floor.</p></div>
      <a className="landing-action" href={REGISTRATION_URL} target="_blank" rel="noreferrer">Sign Up <span aria-hidden="true">→</span></a>
    </section>
  </>;
}

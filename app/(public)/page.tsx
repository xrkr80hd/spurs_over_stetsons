import Image from "next/image";
import Link from "next/link";

const EBALLROOM_URL = "https://www.eballroom.com";

export default function HomePage() {
  return <>
    <section className="landing-hero">
      <div className="landing-copy">
        <p className="landing-eyebrow">ALEXANDRIA, LOUISIANA</p>
        <h1>Let&apos;s<br/><em>dance.</em></h1>
        <p className="landing-intro">Country dance lessons and a welcoming dance-floor experience for beginners, seasoned dancers, and everyone in between.</p>
        <div className="landing-actions">
          <Link className="landing-action" href="/signup">Sign Up <span aria-hidden="true">→</span></Link>
          <a className="landing-secondary" href={EBALLROOM_URL} target="_blank" rel="noreferrer">eBallroom Login ↗</a>
        </div>
        <small>Send us your information to get started. Once your account is ready, you&apos;ll use eBallroom to log in.</small>
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
      <div><p className="landing-eyebrow">GET STARTED</p><h2>Ready to join us?</h2><p>Send us your information and our staff will help set up your eBallroom account.</p></div>
      <Link className="landing-action" href="/signup">Sign Up <span aria-hidden="true">→</span></Link>
    </section>
  </>;
}

import { danceClasses } from "@/lib/class-descriptions";


export function ClassDescriptions() {
  return <section id="classes" className="class-descriptions" aria-labelledby="classes-title">
    <p className="landing-eyebrow">FIND YOUR NEXT STEP</p>
    <h2 id="classes-title">Our Dance Classes</h2>
    <div className="class-description-grid">{danceClasses.map(item => <article key={item.name} className="class-description-card">
      <h3>{item.name}</h3>
      <p className="class-description-tagline">{item.tagline}</p>
      {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <p className="class-description-audience"><strong>Perfect for:</strong> {item.perfectFor}</p>
    </article>)}</div>
    <a className="landing-action" href="#calendar">View Events &amp; Schedule <span aria-hidden="true">↓</span></a>
  </section>;
}

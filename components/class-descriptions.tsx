const classes = [
  { name: "Beginner Country", icon: "🤠", tagline: "No experience needed — start here!", paragraphs: ["Designed for brand-new dancers, Beginner Country teaches the foundations you need to feel comfortable and confident on the dance floor. You’ll learn basic footwork, timing, rhythm, partnering, leading and following, and introductory country dance patterns.", "Come as you are, bring a partner or come solo, and get ready to have fun!"], perfectFor: "First-time dancers, couples, date nights, and anyone wanting to learn country dancing from the ground up." },
  { name: "Novice Country", icon: "👢", tagline: "You know the basics — now let’s build on them.", paragraphs: ["Novice Country is the next step after Beginner Country. Dancers will expand their vocabulary with more patterns, turns, transitions, styling, and stronger lead-and-follow technique.", "The focus is on becoming smoother, more confident, and more comfortable dancing socially while continuing to develop solid fundamentals."], perfectFor: "Dancers who are comfortable with the basics and ready for the next challenge." },
  { name: "Ballroom", icon: "💃", tagline: "Classic dancing. Great technique. Confidence for any dance floor.", paragraphs: ["Our Ballroom class introduces dancers to the fundamentals of popular ballroom styles while developing partnership, posture, timing, connection, and movement.", "Whether you’re learning for fun, preparing for a special event, or looking to become a more well-rounded dancer, this class will give you skills that carry over into every style of partner dancing."], perfectFor: "Couples, singles, social dancers, and anyone wanting to broaden their dance skills." },
  { name: "Line Dance", icon: "🎶", tagline: "No partner needed — just get on the floor!", paragraphs: ["Learn fun, popular line dances in an upbeat and welcoming environment. We break each dance down step-by-step so you can learn the patterns, improve your timing, and build confidence before putting everything together with music.", "From country favorites to today’s popular dances, there’s always something new to learn."], perfectFor: "All ages, groups of friends, beginners, and anyone who wants to dance without needing a partner." },
  { name: "Ladies Technique", icon: "✨", tagline: "Confidence. Styling. Technique. Presence.", paragraphs: ["Ladies Technique is designed to help female dancers take their dancing to the next level. This class focuses on balance, footwork, turns, posture, arm styling, body movement, musicality, and creating clean, confident movement.", "It’s not just about learning more steps — it’s about learning how to make every step look and feel better."], perfectFor: "Women who want to improve their technique, styling, confidence, and overall presence on the dance floor." },
  { name: "Kids Ballroom", icon: "🌟", tagline: "Building confident dancers one step at a time.", paragraphs: ["Kids Ballroom introduces young dancers to partner dancing in a fun, positive, and age-appropriate environment. Students learn rhythm, coordination, posture, footwork, teamwork, partnering, and dance-floor etiquette while building confidence and social skills.", "Our goal is to develop strong dance fundamentals while making sure kids have fun and enjoy learning."], perfectFor: "Young dancers of all experience levels who are ready to learn, move, make friends, and grow in confidence." },
];

export function ClassDescriptions() {
  return <section id="classes" className="class-descriptions" aria-labelledby="classes-title">
    <p className="landing-eyebrow">FIND YOUR NEXT STEP</p>
    <h2 id="classes-title">Our Dance Classes</h2>
    <div className="class-description-grid">{classes.map(item => <article key={item.name} className="class-description-card">
      <span className="class-description-icon" aria-hidden="true">{item.icon}</span>
      <h3>{item.name}</h3>
      <p className="class-description-tagline">{item.tagline}</p>
      {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <p className="class-description-audience"><strong>Perfect for:</strong> {item.perfectFor}</p>
    </article>)}</div>
    <a className="landing-action" href="#calendar">View Events &amp; Schedule <span aria-hidden="true">↓</span></a>
  </section>;
}

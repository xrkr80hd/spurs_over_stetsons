const calendarUrl = "https://clientportal.e-ballroom.com/studio/schedule?studio=1a5f02bc-7804-472e-a5d8-2d002e7d20a3";

export function PublicCalendar() {
  return <section id="calendar" className="public-calendar" aria-labelledby="calendar-title">
    <p className="landing-eyebrow">MEET US ON THE DANCE FLOOR</p>
    <h2 id="calendar-title">Events &amp; Schedule</h2>
    <p>Select your class in the e‑Ballroom calendar below. All times are Central.</p>
    <p><a className="landing-action" href={calendarUrl}>Open class calendar &amp; booking ↗</a></p>
    <iframe className="eballroom-calendar" title="Spurs Over Stetsons e-Ballroom class calendar and booking" src={calendarUrl} loading="lazy" />
    <p>If the calendar does not load here, use “Open class calendar &amp; booking” above.</p>
  </section>;
}

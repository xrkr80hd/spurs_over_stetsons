"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type DanceEvent = {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  extendedProps?: { classType?: string; instructorName?: string | null; price?: number | null; spotsAvailable?: number | null };
};
const timeZone = "America/Chicago";
const signup = "https://my.e-ballroom.com/register?studio=4b9f0d88-9edc-4390-8998-93937355999e";

// Offset-free feed timestamps represent studio wall time, not the visitor's timezone.
function studioDate(value: string) {
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(value)) return value.slice(0, 10);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  return ["year", "month", "day"].map((key) => parts.find((part) => part.type === key)?.value).join("-");
}
function studioTime(value: string) {
  const zoned = /(Z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: zoned ? timeZone : "UTC" }).format(new Date(zoned ? value : `${value}Z`));
}

const subscribe = () => () => {};
export function PublicCalendar() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <CalendarContent /> : <section id="calendar" className="public-calendar"><h2>Classes &amp; dances</h2><p>Loading calendar…</p></section>;
}

function CalendarContent() {
  const [month, setMonth] = useState(() => studioDate(new Date().toISOString()).slice(0, 7));
  const [result, setResult] = useState<{ month: string; events: DanceEvent[]; error?: string } | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!month) return;
    const controller = new AbortController();
    fetch(`/api/calendar?month=${month}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Calendar unavailable");
        const events: DanceEvent[] = await response.json();
        if (!controller.signal.aborted) setResult({ month, events });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ month, events: [], error: "We couldn’t load the calendar. Please try again." });
      });
    return () => controller.abort();
  }, [month, retry]);

  const loading = !month || result?.month !== month;
  const events = loading ? [] : result.events.filter((event) => studioDate(event.start).startsWith(month)).sort((a, b) => a.start.localeCompare(b.start));
  const [year, number] = month.split("-").map(Number);
  const date = month ? new Date(Date.UTC(year, number - 1, 1)) : null;
  const label = date ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(date) : "Calendar";
  const days = date ? new Date(Date.UTC(year, number, 0)).getUTCDate() : 0;
  const byDay = new Map<string, DanceEvent[]>();
  for (const event of events) {
    const key = studioDate(event.start);
    byDay.set(key, [...(byDay.get(key) ?? []), event]);
  }
  function move(amount: number) {
    setResult(null);
    setMonth(new Date(Date.UTC(year, number - 1 + amount, 1)).toISOString().slice(0, 7));
  }
  return <section id="calendar" className="public-calendar" aria-labelledby="calendar-title">
    <p className="landing-eyebrow">MEET US ON THE DANCE FLOOR</p>
    <h2 id="calendar-title">Classes &amp; dances</h2>
    <p>Explore group classes and social dances. All times are Alexandria, Louisiana time (Central).</p>
    <div className="calendar-toolbar">
      <h3>{label}</h3>
      <div>
        <button className="btn" disabled={!month} onClick={() => move(-1)} aria-label="Previous month">←</button>
        <button className="btn" onClick={() => { setResult(null); setMonth(studioDate(new Date().toISOString()).slice(0, 7)); setRetry((value) => value + 1); }}>This month</button>
        <button className="btn" disabled={!month} onClick={() => move(1)} aria-label="Next month">→</button>
      </div>
    </div>
    <div aria-live="polite" aria-busy={loading}>
      {loading ? <p className="empty">Loading calendar…</p> : result.error ? <div className="empty"><p>{result.error}</p><button className="btn" onClick={() => { setResult(null); setRetry((value) => value + 1); }}>Try again</button></div> : <>
        <div className="calendar-grid" aria-label={label}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
          {Array.from({ length: date?.getUTCDay() ?? 0 }, (_, index) => <div className="calendar-blank" key={`blank-${index}`} />)}
          {Array.from({ length: days }, (_, index) => {
            const key = `${month}-${String(index + 1).padStart(2, "0")}`;
            return <div className="calendar-day" key={key}><time dateTime={key}>{index + 1}</time>{(byDay.get(key) ?? []).map((event) => <a key={event.id} href={`#dance-${event.id}`} className="calendar-event"><span>{studioTime(event.start)}</span>{event.title}</a>)}</div>;
          })}
        </div>
        {events.length === 0 ? <p className="empty">No classes or dances are posted for {label} yet. Check back soon.</p> : <div className="calendar-agenda">
          {events.map((event) => <article id={`dance-${event.id}`} key={event.id}>
            <p className="landing-eyebrow">{studioDate(event.start)} · {studioTime(event.start)}{event.end ? ` – ${studioTime(event.end)}` : ""}</p>
            <h4>{event.title}</h4>
            <p>{event.extendedProps?.classType === "SocialDance" ? "Social dance" : "Group class"}{event.extendedProps?.instructorName ? ` · ${event.extendedProps.instructorName}` : ""}</p>
            <p>{event.extendedProps?.price != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(event.extendedProps.price) : ""}{event.extendedProps?.spotsAvailable != null ? ` · ${event.extendedProps.spotsAvailable > 0 ? `${event.extendedProps.spotsAvailable} spots available` : "Full"}` : ""}</p>
          </article>)}
        </div>}
      </>}
    </div>
    <div className="calendar-account"><a className="landing-action" href={signup}>Sign Up <span aria-hidden="true">→</span></a><a href="https://my.e-ballroom.com/login">Already have a student account? Log in ↗</a></div>
  </section>;
}

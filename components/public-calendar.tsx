"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
  return mounted ? <CalendarContent /> : <section id="calendar" className="public-calendar"><h2>Events &amp; Schedule</h2><p>Loading calendar…</p></section>;
}


function shiftMonth(month: string, amount: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + amount, 1)).toISOString().slice(0, 7);
}
function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(month + "-01T12:00:00Z"));
}
function CalendarContent() {
  const today = studioDate(new Date().toISOString());
  const [month, setMonth] = useState(today.slice(0, 7));
  const [heading, setHeading] = useState(month);
  const [range, setRange] = useState({ first: shiftMonth(month, -1), last: shiftMonth(month, 3) });
  const [cache, setCache] = useState<Record<string, DanceEvent[]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [retry, setRetry] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(month + "-01");
  const previousHeight = useRef<number | null>(null);
  const [selected, setSelected] = useState("");
  const [activeEvent, setActiveEvent] = useState<DanceEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (activeEvent) dialog.current?.showModal();
    else dialog.current?.close();
  }, [activeEvent]);
  const months: string[] = [];
  for (let m = range.first; m <= range.last; m = shiftMonth(m, 1)) months.push(m);

  useEffect(() => {
    const controller = new AbortController();
    const wanted: string[] = [];
    for (let m = range.first; m <= range.last; m = shiftMonth(m, 1)) wanted.push(m);
    for (const m of wanted) {
      fetch(`/api/calendar?month=${m}`, { signal: controller.signal })
        .then(async response => {
          if (!response.ok) throw new Error("Unavailable");
          const data: DanceEvent[] = await response.json();
          if (!controller.signal.aborted) {
            setCache(old => ({ ...old, [m]: data.filter(e => studioDate(e.start).startsWith(m)).sort((a,b) => a.start.localeCompare(b.start)) }));
            setErrors(old => ({ ...old, [m]: false }));
          }
        }).catch(() => { if (!controller.signal.aborted) setErrors(old => ({ ...old, [m]: true })); });
    }
    return () => controller.abort();
  }, [range.first, range.last, retry]);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    if (previousHeight.current !== null) {
      el.scrollTop += el.scrollHeight - previousHeight.current;
      previousHeight.current = null;
    }
    if (pending.current) {
      const key = pending.current;
      const target = Array.from(el.querySelectorAll<HTMLElement>("[data-date]")).find(node => (node.dataset.date ?? "") >= key);
      if (target && cache[key.slice(0,7)]) {
        el.scrollTop += target.getBoundingClientRect().top - el.getBoundingClientRect().top;
        pending.current = null;
      }
    }
  }, [cache, range]);

  function jump(key: string) {
    setSelected(key);
    setMonth(key.slice(0,7));
    setHeading(key.slice(0,7));
    pending.current = key;
    setRange(old => ({ first: old.first < key.slice(0,7) ? old.first : shiftMonth(key.slice(0,7), -1), last: old.last > key.slice(0,7) ? old.last : shiftMonth(key.slice(0,7), 3) }));
    const el = list.current;
    const target = el && Array.from(el.querySelectorAll<HTMLElement>("[data-date]")).find(node => (node.dataset.date ?? "") >= key);
    if (el && target) {
      el.scrollTo({ top: el.scrollTop + target.getBoundingClientRect().top - el.getBoundingClientRect().top, behavior: "instant" });
      pending.current = null;
    }
  }
  function trackMonth() {
    const el = list.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    const first = Array.from(el.querySelectorAll<HTMLElement>("[data-month]")).find(node => node.getBoundingClientRect().bottom > top + 4);
    if (first?.dataset.month) setHeading(first.dataset.month);
  }
  const events = cache[month] ?? [];
  const [year, number] = month.split("-").map(Number);
  const offset = new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells = Math.ceil((offset + days) / 7) * 7;
  return <section id="calendar" className="public-calendar" aria-labelledby="calendar-title">
    <p className="landing-eyebrow">MEET US ON THE DANCE FLOOR</p>
    <h2 id="calendar-title">Events &amp; Schedule</h2>
    <p>Click on a calendar item for details. All times are Central.</p>
    <div className="calendar-toolbar">
      <h3>{monthLabel(month)}</h3>
      <div><button className="btn" onClick={() => jump(shiftMonth(month,-1) + "-01")} aria-label="Previous month">←</button>
      <button className="btn" onClick={() => jump(today)}>Today</button>
      <button className="btn" onClick={() => jump(shiftMonth(month,1) + "-01")} aria-label="Next month">→</button></div>
    </div>
    <div className="calendar-grid calendar-compact" aria-label={monthLabel(month)}>
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <div className="calendar-weekday" key={day}>{day}</div>)}
      {Array.from({ length: cells }, (_, i) => {
        const day = i - offset + 1;
        if (day < 1 || day > days) return <div className="calendar-blank" key={i} />;
        const key = `${month}-${String(day).padStart(2,"0")}`;
        const count = events.filter(e => studioDate(e.start) === key).length;
        const dayEvents = events.filter(e => studioDate(e.start) === key);
        return <div className={`calendar-day ${count ? "has-events" : ""} ${selected === key ? "is-selected" : ""}`} key={i}>
          <button className="calendar-date-button" aria-label={`${monthLabel(month)} ${day}, ${count} scheduled events`} aria-pressed={selected === key} aria-current={key === today ? "date" : undefined} onClick={() => jump(key)}><time dateTime={key}>{day}</time></button>
          {dayEvents.slice(0,2).map(event => <button key={event.id} className="calendar-class-button"
            title={`${event.title} · ${studioTime(event.start)}${event.extendedProps?.instructorName ? " · " + event.extendedProps.instructorName : ""}`}
            aria-label={`View ${event.title}, ${studioTime(event.start)}`} onClick={() => { setSelected(key); setActiveEvent(event); }}>
            <span>{event.title}</span>
          </button>)}
          {count > 2 && <button className="calendar-more-events" onClick={() => jump(key)}>+{count-2} more</button>}
        </div>;
      })}
    </div>
    {errors[month] && <p role="status">Calendar unavailable. <button className="btn" onClick={() => setRetry(n => n+1)}>Try again</button></p>}
    <div className="glance-title"><h3>Classes at a Glance</h3><span>Scroll to explore ↕</span></div>
    <div className="glance-panel">
      <div className="glance-month" aria-live="polite">{monthLabel(heading)}</div>
      <div ref={list} className="glance-scroll" role="region" aria-label="Classes at a Glance — scroll for more dates" tabIndex={0} onScroll={trackMonth}>
        <button className="glance-more" onClick={() => { previousHeight.current = list.current?.scrollHeight ?? null; setRange(r => ({ ...r, first: shiftMonth(r.first,-3) })); }}>↑ Earlier months</button>
        {months.map(m => <div key={m} data-month={m}>
          {cache[m] ? cache[m].length ? cache[m].map(event => {
            const date = studioDate(event.start);
            const props = event.extendedProps;
            const full = props?.spotsAvailable != null && props.spotsAvailable <= 0;
            return <article className={`glance-card ${selected === date ? "is-highlighted" : ""}`} key={event.id} data-date={date}>
              <div className="glance-date"><span>{new Intl.DateTimeFormat("en-US",{month:"short",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z"))}</span><strong>{Number(date.slice(8))}</strong></div>
              <div className="glance-info">
                <p className="glance-time">{studioTime(event.start)}{event.end ? ` – ${studioTime(event.end)}` : ""}</p>
                <h4 title={event.title}>{event.title}</h4>
                <p className="glance-detail">{props?.classType === "SocialDance" ? "Social dance" : "Group class"}{props?.instructorName ? ` · ${props.instructorName}` : ""}</p>
                <div className="glance-bottom"><span>{props?.price != null ? new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(props.price) : "See booking details"}{full ? " · Full" : ""}</span>
                <a href={full ? "https://my.e-ballroom.com/login" : signup} aria-label={`${full ? "View availability" : "Sign up"} for ${event.title} on ${date}`}>{full ? "View Availability" : "Sign Up Now"} ↗</a></div>
              </div>
            </article>;
          }) : <div className="glance-empty" data-date={m+"-01"}><strong>{monthLabel(m)}</strong><p>No classes or dances posted yet.</p></div>
          : <div className="glance-empty" data-date={m+"-01"}><strong>{monthLabel(m)}</strong><p>{errors[m] ? "Schedule temporarily unavailable." : "Loading classes…"}</p>{errors[m] && <button className="btn" onClick={() => setRetry(n=>n+1)}>Try again</button>}</div>}
        </div>)}
        <button className="glance-more" onClick={() => setRange(r => ({ ...r, last: shiftMonth(r.last,3) }))}>Later months ↓</button>
      </div>
    </div>
    <dialog ref={dialog} className="class-modal" onCancel={() => setActiveEvent(null)} onClose={() => setActiveEvent(null)} onClick={event => { if (event.target === event.currentTarget) setActiveEvent(null); }} aria-labelledby="class-modal-title">
      {activeEvent && <div className="class-modal-content">
        <button className="class-modal-close" aria-label="Close class details" onClick={() => setActiveEvent(null)}>×</button>
        <p className="landing-eyebrow">{activeEvent.extendedProps?.classType === "SocialDance" ? "SOCIAL DANCE" : "GROUP CLASS"}</p>
        <h3 id="class-modal-title">{activeEvent.title}</h3>
        <p>{new Intl.DateTimeFormat("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric", timeZone:"UTC" }).format(new Date(studioDate(activeEvent.start)+"T12:00:00Z"))}</p>
        <p>{studioTime(activeEvent.start)}{activeEvent.end ? " – " + studioTime(activeEvent.end) : ""} · Central</p>
        {activeEvent.extendedProps?.instructorName && <p>Instructor: {activeEvent.extendedProps.instructorName}</p>}
        {activeEvent.extendedProps?.price != null && <p>{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(activeEvent.extendedProps.price)}</p>}
        {activeEvent.extendedProps?.spotsAvailable != null && <p>{activeEvent.extendedProps.spotsAvailable > 0 ? activeEvent.extendedProps.spotsAvailable + " spots available" : "Currently full"}</p>}
        <a className="landing-action" href={activeEvent.extendedProps?.spotsAvailable != null && activeEvent.extendedProps.spotsAvailable <= 0 ? "https://my.e-ballroom.com/login" : signup}>{activeEvent.extendedProps?.spotsAvailable != null && activeEvent.extendedProps.spotsAvailable <= 0 ? "View Availability" : "Sign Up Now"} ↗</a>
      </div>}
    </dialog>
    <p className="glance-note">Registration and current availability are confirmed in eBallroom.</p>
    <div className="calendar-account"><a href="https://my.e-ballroom.com/login">Already have a student account? Log in ↗</a></div>
  </section>;
}

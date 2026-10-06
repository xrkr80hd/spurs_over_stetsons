"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { danceClasses } from "@/lib/class-descriptions";

type DanceEvent = {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  extendedProps?: { description?: string | null; classType?: string; instructorName?: string | null; price?: number | null; spotsAvailable?: number | null };
};
function bookingUrl(event: DanceEvent) {
  return "/book?" + new URLSearchParams({ title: event.title, date: studioDate(event.start), time: studioTime(event.start) + (event.end ? " – " + studioTime(event.end) : "") }).toString();
}
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
  const [cache, setCache] = useState<Record<string, DanceEvent[]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState("");
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<DanceEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (openDate && !dialog.current?.open) dialog.current?.showModal();
    else if (!openDate) dialog.current?.close();
  }, [openDate]);
  useEffect(() => {
    const controller = new AbortController();
    const wanted: string[] = [];
    wanted.push(month);
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
  }, [month, retry]);

  function jump(key: string) {
    setSelected(key);
    setMonth(key.slice(0, 7));
  }
  function openDay(key: string) {
    setSelected(key);
    setActiveEvent(null);
    setOpenDate(key);
  }
  function goBack() {
    if (activeEvent) setActiveEvent(null);
    else setOpenDate(null);
  }
  const events = cache[month] ?? [];
  const [year, number] = month.split("-").map(Number);
  const offset = new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells = Math.ceil((offset + days) / 7) * 7;
  return <section id="calendar" className="public-calendar" aria-labelledby="calendar-title">
    <p className="landing-eyebrow">MEET US ON THE DANCE FLOOR</p>
    <h2 id="calendar-title">Events &amp; Schedule</h2>
    <p>Hover over a date to preview classes. Click or tap a date for the full list. All times are Central.</p>
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
          <button className="calendar-day-trigger" aria-label={`${monthLabel(month)} ${day}, ${count} scheduled events. Open full class list`} aria-haspopup="dialog" aria-current={key === today ? "date" : undefined} onClick={() => openDay(key)}>
            <time dateTime={key}>{day}</time>
            <span className="calendar-day-titles">{dayEvents.slice(0,2).map(event => <span key={event.id} className="calendar-short-title">{shortTitle(event.title)}</span>)}</span>
            {count > 2 && <span className="calendar-day-more">+{count-2} more</span>}
          </button>
          {!!count && <div className={`calendar-hover-preview ${i % 7 > 3 ? "preview-right" : ""}`} aria-hidden="true">
            <strong>{dateLabel(key)}</strong>
            {dayEvents.map(event => <p key={event.id}><span>{event.title}</span><small>{studioTime(event.start)}</small></p>)}
            <small>Click the date to view classes</small>
          </div>}
        </div>;
      })}
    </div>
    {errors[month] && <p role="status">Calendar unavailable. <button className="btn" onClick={() => setRetry(n => n+1)}>Try again</button></p>}
    <dialog ref={dialog} className="class-modal" onCancel={event => { event.preventDefault(); goBack(); }} onClose={() => { setOpenDate(null); setActiveEvent(null); }} onClick={event => { if (event.target === event.currentTarget) goBack(); }} aria-labelledby="class-modal-title">
      {openDate && <div className="class-modal-content">
        <button className="class-modal-close" aria-label={activeEvent ? "Back to class list" : "Close class list"} onClick={goBack}>×</button>
        {activeEvent ? <>
          <button className="class-list-back" onClick={() => setActiveEvent(null)}>← All classes for this date</button>
          <p className="landing-eyebrow">{activeEvent.extendedProps?.classType === "SocialDance" ? "SOCIAL DANCE" : "GROUP CLASS"}</p>
          <h3 id="class-modal-title" tabIndex={-1} ref={node => node?.focus()}>{activeEvent.title}</h3>
          <p>{dateLabel(openDate)}</p>
          <p>{studioTime(activeEvent.start)}{activeEvent.end ? " – " + studioTime(activeEvent.end) : ""} · Central</p>
          <p><strong>Instructor:</strong> {activeEvent.extendedProps?.instructorName || "To be announced"}</p>
          <ClassDetail event={activeEvent}/>
          {activeEvent.extendedProps?.price != null && <p>{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(activeEvent.extendedProps.price)}</p>}
          {activeEvent.extendedProps?.spotsAvailable != null && <p>{activeEvent.extendedProps.spotsAvailable > 0 ? activeEvent.extendedProps.spotsAvailable + " spots available" : "Currently full"}</p>}
          <a className="landing-action" href={bookingUrl(activeEvent)}>{activeEvent.extendedProps?.spotsAvailable != null && activeEvent.extendedProps.spotsAvailable <= 0 ? "View Availability" : "Sign Up for This Class"} ↗</a>
        </> : <>
          <p className="landing-eyebrow">CLASSES &amp; DANCES</p>
          <h3 id="class-modal-title" tabIndex={-1} ref={node => node?.focus()}>{dateLabel(openDate)}</h3>
          <div className="calendar-date-list">{events.filter(event => studioDate(event.start) === openDate).map(event => <button className="calendar-date-class" key={event.id} onClick={() => setActiveEvent(event)}>
            <strong>{event.title}</strong>
            <span>{studioTime(event.start)}{event.end ? " – " + studioTime(event.end) : ""} · Central</span>
            <span>{event.extendedProps?.instructorName || "Instructor to be announced"}</span>
            <span className="calendar-detail-link">View class details →</span>
          </button>)}</div>
          {!events.some(event => studioDate(event.start) === openDate) && <p>{errors[month] ? "Schedule temporarily unavailable. Close this window and try again." : cache[month] ? "No classes or dances scheduled for this date." : "Loading classes…"}</p>}
        </>}
      </div>}
    </dialog>
    <div className="calendar-account"><a href={signup}>New student? Create an account ↗</a><a href="https://my.e-ballroom.com/login">Already a student? Log in ↗</a></div>
  </section>;
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric", timeZone:"UTC" }).format(new Date(date+"T12:00:00Z"));
}
function shortTitle(title: string) {
  return title.replace(/\s*-\s*(Group Class|Social Dance)\b.*$/i, "").replace(/\s*\([^)]*\)\s*$/, "").replace(/Beginner/gi,"Beg.").replace(/Country/gi,"Ctry.").replace(/Technique/gi,"Tech.").replace(/Ballroom/gi,"Ballrm.");
}
function ClassDetail({event}: {event: DanceEvent}) {
  const description = danceClasses.find(item => event.title.toLowerCase().includes(item.name.toLowerCase()));
  if (event.extendedProps?.description) return <p className="calendar-description-text">{event.extendedProps.description}</p>;
  if (!description) return <p>Contact the studio for more information about this {event.extendedProps?.classType === "SocialDance" ? "dance" : "class"}.</p>;
  return <div><p><strong>{description.tagline}</strong></p>{description.paragraphs.map(text => <p key={text}>{text}</p>)}<p><strong>Perfect for:</strong> {description.perfectFor}</p></div>;
}

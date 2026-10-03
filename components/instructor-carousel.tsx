"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./instructor-carousel.module.css";
const instructors = [{"name":"Jennifer Solano","photo":"/instructors/jennifer-solano-dance.jpg","secondaryPhoto":"photos/jennifer-solano-dance.jpg","bio":"Born in Costa Rica, Jennifer Solano began dancing at age five and went on to become a certified ballroom instructor. Her career has taken her from Hawaii, Los Angeles and New York to eight years in Las Vegas. Her experience includes studio instruction, television dance work and live concert performances, bringing polished professional experience and a lifelong passion for dance to her students.","width":1536,"height":1532,"crop":null},{"name":"Rody Broussard","photo":"/instructors/rody-broussard.jpg","bio":"Rody Broussard brings 40 years of dancing and teaching experience to the floor. He teaches Ballroom, Country and Cajun styles, working with students from beginner through advanced levels. His instruction spans social and competitive dancing as well as private and group lessons, with an emphasis on patient teaching, strong technique and helping every student become comfortable and confident on the dance floor.","width":1153,"height":1536,"crop":null},{"name":"Mandy Frazier","photo":"/instructors/mandy-frazier.jpg","bio":"Mandy Frazier brings 19 years of dance experience as an instructor, choreographer and dance educator. Her background includes extensive performance, competitive dance and classroom instruction, from school dance programs to college-level courses. Mandy combines technique, energy and encouragement to help students strengthen their skills, build confidence and develop a lasting enjoyment of dance.","width":1135,"height":1536,"crop":[27,218,1055,1318]},{"name":"Dale Tosczak","photo":"/instructors/dale-tosczak.jpg","bio":"Dale Tosczak has taught dance since 2000, beginning in Country before expanding into American Style Ballroom, Latin, Salsa and Tango. A two-time UCWDC World Championships Pro-Pro Division winner, Dale is proficient in more than 20 dances. He teaches beginner through advanced students in both social and competitive formats, including Pro-Am, while keeping lessons approachable, engaging and enjoyable.","width":1181,"height":1536,"crop":null},{"name":"Sue McCann","photo":"/instructors/sue-mccann.png","bio":"Sue McCann began competing in 2000 and is a three-time world champion in Country Western dance. A certified American Country Western Dance judge, she has taught since 2006 and works with both social and competitive dancers. Sue focuses on clear instruction, confidence and enjoyment, helping students take their first steps or continue developing toward their next goal on the dance floor.","width":1152,"height":1536,"crop":null}];
type Instructor = typeof instructors[number];

function Portrait({ person }: { person: Instructor }) {
  const [x,y,w,h] = person.crop ?? [0,0,person.width,person.height];
  const scale = Math.min(400/w,300/h);
  const picture = <svg x={(400-w*scale)/2} y={(300-h*scale)/2} width={w*scale} height={h*scale} viewBox={[x,y,w,h].join(" ")} overflow="hidden">
    <image href={person.photo} width={person.width} height={person.height}/>
  </svg>;
  return <span className={styles.portrait}>
    <svg className={styles.blur} viewBox="0 0 400 300" aria-hidden="true">{picture}</svg>
    <svg className={styles.photo} viewBox="0 0 400 300" role="img" aria-label={person.name}>{picture}</svg>
  </span>;
}
export function InstructorCarousel() {
  const [step,setStep] = useState(0);
  const [paused,setPaused] = useState(false);
  const [hover,setHover] = useState(false);
  const [focused,setFocused] = useState(false);
  const [reduced,setReduced] = useState(false);
  const [active,setActive] = useState<Instructor|null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const index = ((step % instructors.length) + instructors.length) % instructors.length;
  const stopped = paused || hover || focused || reduced || !!active;
  useEffect(() => {
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>setReduced(media.matches);
    sync(); media.addEventListener("change",sync);
    return ()=>media.removeEventListener("change",sync);
  },[]);
  useEffect(() => {
    if(stopped) return;
    const timer=window.setInterval(()=>{ if(!document.hidden) setStep(s=>s+1); },8000);
    return ()=>window.clearInterval(timer);
  },[stopped,step]);
  useEffect(()=>{
    if(!active) return;
    const el=dialog.current;
    el?.showModal();
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{el?.close();document.body.style.overflow=previous;};
  },[active]);
  return <section id="instructors" className={styles.section} aria-labelledby="instructors-title" aria-roledescription="carousel"
    onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(false);}}>
    <div className={styles.heading}><p className="landing-eyebrow">THE PEOPLE BEHIND THE STEPS</p><h2 id="instructors-title">Meet Our Dance Instructors</h2><p>Get to know the people who make every lesson your own.</p></div>
    <div className={styles.stage} aria-live={stopped?"polite":"off"}>
      {instructors.map((person,i)=><article key={person.name} className={styles.slide+" "+(step%2!==0?styles.reverse:"")} aria-hidden={i!==index} inert={i!==index} style={{visibility:i===index?"visible":"hidden"}} aria-roledescription="slide" aria-label={`${i+1} of ${instructors.length}`}>
        <button className={styles.photoButton} onClick={()=>setActive(person)} aria-label={"View "+person.name+" profile"}><Portrait person={person}/><span className={styles.photoHint}>View instructor ↗</span></button>
        <div className={styles.bio}><p className={styles.label}>DANCE INSTRUCTOR</p><h3><button onClick={()=>setActive(person)}>{person.name}</button></h3><p>{person.bio}</p><button className={styles.details} onClick={()=>setActive(person)}>Meet {person.name.split(" ")[0]} <span aria-hidden="true">↗</span></button></div>
      </article>)}
    </div>
    <div className={styles.controls}>
      <button aria-label="Previous instructor" onClick={()=>setStep(s=>s-1)}>←</button>
      <span>{index+1} / {instructors.length}</span>
      <button aria-label="Next instructor" onClick={()=>setStep(s=>s+1)}>→</button>
      {!reduced && <button aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?"Play":"Pause"}</button>}
    </div>
    <dialog ref={dialog} className={styles.modal} onCancel={()=>setActive(null)} onClose={()=>setActive(null)} onClick={e=>{if(e.target===e.currentTarget)setActive(null);}} aria-labelledby="instructor-modal-name">
      {active && <div className={styles.modalInner}><button className={styles.close} aria-label="Close instructor profile" onClick={()=>setActive(null)}>×</button><Portrait person={active}/><div><p className={styles.label}>MEET YOUR INSTRUCTOR</p><h2 id="instructor-modal-name">{active.name}</h2><p>{active.bio}</p></div></div>}
    </dialog>
  </section>;
}

// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { CustomCalendar } from "../components/custom-calendar";

it("shows every class and returns from details to the date list before closing", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const date = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Chicago"}).format(new Date());
  const events = ["Beginner Country", "Novice Country", "Ballroom", "Line Dance"].map((title,i)=>({id:String(i),title,start:date+"T18:00:00",extendedProps:{instructorName:"Test Instructor"}}));
  vi.stubGlobal("fetch", vi.fn(async()=>({ok:true,json:async()=>events})));
  HTMLDialogElement.prototype.showModal = function(){this.setAttribute("open","");};
  HTMLDialogElement.prototype.close = function(){this.removeAttribute("open");};
  const host=document.createElement("div");document.body.append(host);const root=createRoot(host);
  try {
    await act(async()=>{root.render(<CustomCalendar/>);});
    expect(host.textContent).not.toContain("Classes at a Glance");
    const dateButton=host.querySelector(`button[aria-current="date"]`) as HTMLButtonElement;
    await act(async()=>dateButton.click());
    expect(host.querySelectorAll(".calendar-date-class")).toHaveLength(4);
    await act(async()=>(host.querySelector(".calendar-date-class") as HTMLButtonElement).click());
    expect(host.querySelector("dialog")?.textContent).toContain("Test Instructor");
    expect(host.querySelector("dialog")?.textContent).toContain("Designed for brand-new dancers");
    expect(host.querySelector("dialog a")?.textContent).toContain("Sign in to e‑Ballroom to Book");
    expect((host.querySelector("dialog a.landing-action") as HTMLAnchorElement).getAttribute("href")).toBe("https://my.e-ballroom.com/login");
    await act(async()=>(host.querySelector(".class-modal-close") as HTMLButtonElement).click());
    expect(host.querySelectorAll(".calendar-date-class")).toHaveLength(4);
    expect(host.querySelector("dialog")?.hasAttribute("open")).toBe(true);
    await act(async()=>(host.querySelector(".class-modal-close") as HTMLButtonElement).click());
    expect(host.querySelector("dialog")?.hasAttribute("open")).toBe(false);
  } finally {await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();}
});

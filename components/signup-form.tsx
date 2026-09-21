"use client";
import { useActionState } from "react";
import { submitSignup, type SignupState } from "@/app/signup/actions";

const initial: SignupState = {};

export function SignupForm() {
  const [state, action, pending] = useActionState(submitSignup, initial);
  if (state.success) return <div className="signup-success"><p className="landing-eyebrow">SIGNUP RECEIVED</p><h2>We have your information.</h2><p>Our staff will create your eBallroom account and contact you with your login information.</p></div>;
  return <form action={action} className="signup-form">
    <div className="field"><label htmlFor="full_name">Full name</label><input id="full_name" name="full_name" autoComplete="name" required /></div>
    <div className="signup-grid"><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div><div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" required /></div></div>
    <div className="signup-grid"><div className="field"><label htmlFor="preferred_contact">Best way to reach you</label><select id="preferred_contact" name="preferred_contact" defaultValue="text"><option value="text">Text</option><option value="phone">Phone call</option><option value="email">Email</option></select></div><div className="field"><label htmlFor="experience_level">Dance experience</label><select id="experience_level" name="experience_level" defaultValue="new"><option value="new">Brand new</option><option value="beginner">Some experience</option><option value="experienced">Experienced dancer</option></select></div></div>
    <div className="field"><label htmlFor="notes">Anything you&apos;d like us to know? <span>Optional</span></label><textarea id="notes" name="notes" rows={4} /></div>
    {state.error&&<p role="alert" className="signup-error">{state.error}</p>}
    <button className="landing-action" disabled={pending}>{pending?"Sending…":"Send My Information"}<span aria-hidden="true">→</span></button>
    <p className="signup-privacy">Your information is used only to create your account and contact you.</p>
  </form>;
}

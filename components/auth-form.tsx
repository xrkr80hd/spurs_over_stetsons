"use client";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/auth/actions";

const initial: AuthState = {};

export function AuthForm() {
  const [state, action, pending] = useActionState(signIn, initial);
  return <div className="panel w-full max-w-lg p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[var(--accent2)]">Authorized access</p><h1 className="western my-2 text-4xl font-bold">Admin login</h1><p className="mb-6 text-sm text-[var(--muted)]">Sign in to manage Spurs Over Stetsons.</p><form action={action} className="grid gap-4"><div className="field"><label>Email</label><input name="email" type="email" autoComplete="username" required /></div><div className="field"><label>Password</label><input name="password" type="password" autoComplete="current-password" required /></div>{state.error&&<p role="alert" className="text-sm text-red-300">{state.error}</p>}<button className="btn btn-primary" disabled={pending}>{pending?"Signing in…":"Sign in"}</button></form></div>;
}

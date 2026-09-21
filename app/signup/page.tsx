import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = { title: "Sign Up", description: "Sign up for Spurs Over Stetsons in Alexandria, Louisiana." };

export default function SignupPage() {
  return <main className="signup-page"><section><p className="landing-eyebrow">GET STARTED</p><h1>Join Spurs Over Stetsons.</h1><p>Send us your information below. Our staff will set up your eBallroom account and contact you with your login details.</p></section><SignupForm /></main>;
}

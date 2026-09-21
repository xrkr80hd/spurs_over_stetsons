import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <main className="grid min-h-screen place-items-center px-4 py-12"><AuthForm /></main>;
}

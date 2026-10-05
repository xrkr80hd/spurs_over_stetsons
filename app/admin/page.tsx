import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer, isStaff } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export default async function AdminLoginPage() {
 const viewer=await getViewer();if(viewer&&isStaff(viewer.roles))redirect("/dashboard/instructors");
 return <main className="grid min-h-screen place-items-center px-4 py-12"><AuthForm /></main>;
}

export type AppRole = "master_admin" | "manager" | "instructor" | "student";
export type SessionStatus = "draft" | "published" | "cancelled" | "completed";
export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";

export interface ClassSession {
  id: string; starts_at: string; ends_at: string; capacity: number; price_cents: number;
  status: SessionStatus; location: string | null;
  class_types: { name: string; level: string | null } | null;
  instructors: { id: string; profiles: { full_name: string } | null } | null;
}

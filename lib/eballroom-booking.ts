/**
 * An exact class-to-eBallroom booking link supplied by the studio.
 *
 * The public eBallroom calendar API exposes class IDs and dates, but not a
 * registration/checkout URL. Never guess one or put login credentials in URLs.
 * Configure real class-specific links through EBALLROOM_CLASS_BOOKING_LINKS_JSON.
 *
 * eBallroom sales-item links can lead to payment after login, but purchasing a
 * package alone is not evidence that a seat in the class was reserved.
 */
export function getEBallroomClassBookingLink(
  classId: string,
  configuredLinks: string | undefined = process.env.EBALLROOM_CLASS_BOOKING_LINKS_JSON,
): string | null {
  if (!/^\d+$/.test(classId) || !configuredLinks) return null;

  try {
    const parsed: unknown = JSON.parse(configuredLinks);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const raw = (parsed as Record<string, unknown>)[classId];
    if (typeof raw !== "string") return null;
    const url = new URL(raw);
    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "my.e-ballroom.com" ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname === "/" ||
      url.pathname.toLowerCase() === "/login"
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

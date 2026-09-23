import { z } from "zod";

const eventSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  start: z.string().refine((value) => Number.isFinite(Date.parse(value))),
  end: z.string().nullable().optional(),
  extendedProps: z.object({
    classType: z.string().optional(),
    instructorName: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
    spotsAvailable: z.number().nullable().optional(),
  }).optional(),
});

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month");
  if (!month || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) {
    return Response.json({ error: "Invalid month" }, { status: 400 });
  }
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const url = new URL("https://clientapi.e-ballroom.com/Studio/UpcomingClasses/calendar");
  url.searchParams.set("studio", "1a5f02bc-7804-472e-a5d8-2d002e7d20a3");
  // Pad the query to cover Central time boundaries; the client filters the month.
  url.searchParams.set("start", `${month}-01T00:00:00`);
  url.searchParams.set("end", new Date(Date.UTC(year, monthNumber - 1, lastDay + 2)).toISOString());
  try {
    const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Calendar unavailable");
    const events = z.array(eventSchema).parse(await response.json());
    return Response.json(events);
  } catch {
    return Response.json({ error: "The calendar is temporarily unavailable. Please try again." }, { status: 502 });
  }
}

export function registrationOutcome(confirmed:number,capacity:number):"confirmed"|"waitlisted" {
  if (!Number.isInteger(confirmed) || !Number.isInteger(capacity) || confirmed < 0 || capacity < 1) throw new Error("Invalid capacity state");
  return confirmed < capacity ? "confirmed" : "waitlisted";
}
export function smsEligible(input:{phone:string|null;optedOutAt:string|null;consent:"opted_in"|"opted_out"|null}) {
  return Boolean(input.phone && !input.optedOutAt && input.consent === "opted_in");
}

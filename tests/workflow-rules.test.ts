import {describe,expect,it} from "vitest"; import {registrationOutcome,smsEligible} from "../lib/workflow-rules";
describe("booking workflow",()=>{
  it("confirms while capacity remains",()=>expect(registrationOutcome(9,10)).toBe("confirmed"));
  it("waitlists at capacity",()=>expect(registrationOutcome(10,10)).toBe("waitlisted"));
  it("waitlists above capacity defensively",()=>expect(registrationOutcome(11,10)).toBe("waitlisted"));
  it("rejects invalid capacity",()=>expect(()=>registrationOutcome(0,0)).toThrow());
});
describe("SMS consent",()=>{
  it("requires a phone and active opt-in",()=>expect(smsEligible({phone:"+13185550100",optedOutAt:null,consent:"opted_in"})).toBe(true));
  it("blocks opted-out recipients",()=>expect(smsEligible({phone:"+13185550100",optedOutAt:new Date().toISOString(),consent:"opted_in"})).toBe(false));
  it("blocks missing consent",()=>expect(smsEligible({phone:"+13185550100",optedOutAt:null,consent:null})).toBe(false));
});

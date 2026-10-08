import { describe, expect, it } from "vitest";
import { getEBallroomClassBookingLink } from "../lib/eballroom-booking";

describe("eBallroom class booking handoff", () => {
  const links = JSON.stringify({
    "1842": "https://my.e-ballroom.com/ViewItem.aspx?guid=3fa8b2ab-556b-4d56-bf21-5e78dbaf2d77&studio=test",
    "1843": "https://evil.example/steal",
    "1844": "https://my.e-ballroom.com.evil.example/",
    "1845": "https://my.e-ballroom.com/",
  });

  it("routes only an exactly configured class to its eBallroom link", () => {
    expect(getEBallroomClassBookingLink("1842", links)).toContain("/ViewItem.aspx?");
    expect(getEBallroomClassBookingLink("1849", links)).toBeNull();
  });
  it("rejects invalid class IDs, malformed configuration, and open redirects", () => {
    expect(getEBallroomClassBookingLink("1843", links)).toBeNull();
    expect(getEBallroomClassBookingLink("1844", links)).toBeNull();
    expect(getEBallroomClassBookingLink("1845", links)).toBeNull();
    expect(getEBallroomClassBookingLink("1842?next=evil", links)).toBeNull();
    expect(getEBallroomClassBookingLink("1842", "{broken")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import {
  PROGRAMMES,
  SLOTS,
  currentSlot,
  nextSlot,
  romeNow,
  slotsForDay,
  toHHMM,
  toMinutes,
} from "./schedule";

/** Fixed instants, Rome time: 2026-11-24 is a Tuesday, CET (UTC+1). */
const TUESDAY_2105 = new Date("2026-11-24T20:05:00Z");
const MONDAY_1100 = new Date("2026-11-23T10:00:00Z");
const SATURDAY_2050 = new Date("2026-11-28T19:50:00Z");

describe("time helpers", () => {
  it("converts HH:MM to minutes and back", () => {
    expect(toMinutes("21:00")).toBe(1260);
    expect(toMinutes("00:30")).toBe(30);
    expect(toHHMM(1290)).toBe("21:30");
    expect(toHHMM(1500)).toBe("01:00");
  });

  it("reads the Rome clock independent of server timezone", () => {
    expect(romeNow(TUESDAY_2105)).toEqual({ day: 2, minutes: 21 * 60 + 5 });
  });
});

describe("the published grid", () => {
  it("every slot points at a known programme", () => {
    for (const slot of SLOTS) {
      expect(PROGRAMMES[slot.programme], `unknown programme ${slot.programme}`).toBeDefined();
      expect(toMinutes(slot.start)).toBeGreaterThanOrEqual(0);
      expect(toMinutes(slot.start)).toBeLessThan(1440);
    }
  });

  it("returns a day's slots sorted by start time", () => {
    const tuesday = slotsForDay(2);
    expect(tuesday.map((entry) => entry.slot.start)).toEqual(["13:00", "21:00", "21:00", "21:00"]);
  });

  it("knows what is on air", () => {
    const live = currentSlot(TUESDAY_2105);
    expect(live?.programme.slug).toBe("a-tutto-mondo");
    expect(live?.endsAt).toBe("22:15");
  });

  it("has no live programme when the grid is empty", () => {
    expect(currentSlot(MONDAY_1100)).toBeNull();
  });

  it("finds the next programme across an empty day", () => {
    const next = nextSlot(MONDAY_1100);
    expect(next?.programme.slug).toBe("capire-per-prevenire");
    expect(next?.when).toBe("domani");
    expect(next?.slot.start).toBe("13:00");
  });

  it("reports tonight's programme as today", () => {
    const next = nextSlot(SATURDAY_2050);
    expect(next?.programme.slug).toBe("ecoagenda");
    expect(next?.when).toBe("oggi");
  });
});

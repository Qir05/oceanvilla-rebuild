import { describe, expect, it } from "vitest";
import {
  VILLA_COMPLIANCE,
  getPhysicalSleepingCapacity,
  countBedroomSpaces,
  validateVillaCompliance,
} from "./villaCompliance";
import { VILLA_STAT_OVERRIDES } from "./ocean-villas";

describe("villa occupancy compliance", () => {
  it("passes all consistency invariants for every listing", () => {
    for (const details of Object.values(VILLA_COMPLIANCE)) {
      expect(validateVillaCompliance(details)).toEqual([]);
    }
  });

  it("resolves Villa 218 (489089) to a licensed maximum of 10 with a physical capacity of 12", () => {
    const villa218 = VILLA_COMPLIANCE["489089"];
    expect(villa218.licensedMaxOccupancy).toBe(10);
    expect(getPhysicalSleepingCapacity(villa218)).toBe(12);
    expect(VILLA_STAT_OVERRIDES["489089"].maxGuests).toBe(10);
  });

  it("never lets Villa 218's public/bookable maximum become 12", () => {
    // Redundant with the strict .toBe(10) checks above by construction, but
    // asserted explicitly per Myra's instruction that 12 must never appear
    // as a guest capacity anywhere for this villa.
    expect(VILLA_COMPLIANCE["489089"].licensedMaxOccupancy).not.toBe(12);
    expect(VILLA_STAT_OVERRIDES["489089"].maxGuests).not.toBe(12);
  });

  it("resolves Villa 318 (489095) to a licensed maximum of 10, with the double queen bedroom at 4 guests (2 adults + 2 children)", () => {
    const villa318 = VILLA_COMPLIANCE["489095"];
    expect(villa318.licensedMaxOccupancy).toBe(10);
    expect(VILLA_STAT_OVERRIDES["489095"].maxGuests).toBe(10);
    const doubleQueen = villa318.sleepingSpaces?.find((s) => s.label === "Double queen bedroom");
    expect(doubleQueen?.guests).toBe(4);
    expect(doubleQueen?.adults).toBe(2);
    expect(doubleQueen?.children).toBe(2);
  });

  it("resolves Villa 119 (489094) to a licensed maximum of 8, with the bunk bed room at 4 guests (2 adults + 2 children)", () => {
    const villa119 = VILLA_COMPLIANCE["489094"];
    expect(villa119.licensedMaxOccupancy).toBe(8);
    expect(VILLA_STAT_OVERRIDES["489094"].maxGuests).toBe(8);
    const bunkRoom = villa119.sleepingSpaces?.find((s) => s.label === "Bunk bed room");
    expect(bunkRoom?.guests).toBe(4);
    expect(bunkRoom?.adults).toBe(2);
    expect(bunkRoom?.children).toBe(2);
  });

  it("resolves Villa 304 (505671) to 8, per the coordinator's later written correction", () => {
    expect(VILLA_COMPLIANCE["505671"].licensedMaxOccupancy).toBe(8);
    expect(VILLA_STAT_OVERRIDES["505671"].maxGuests).toBe(8);
  });

  it("resolves listing 489097 to 12 and carries two license records", () => {
    const combined = VILLA_COMPLIANCE["489097"];
    expect(combined.licensedMaxOccupancy).toBe(12);
    expect(combined.licenses).toHaveLength(2);
    expect(VILLA_STAT_OVERRIDES["489097"].maxGuests).toBe(12);
  });

  it("resolves listing 489097's identity as Unit 119 + Unit 120, not Unit 111", () => {
    const combined = VILLA_COMPLIANCE["489097"];
    const units = combined.licenses.map((l) => l.unit);
    expect(units).toContain("Villa 119");
    expect(units).toContain("Villa 120");
    expect(units).not.toContain("Villa 111");
    expect(units).not.toContain("Ohana");
  });

  it("resolves listing 489097's bunk bed room (from Unit 119) to 4 guests as 2 adults + 2 children", () => {
    const combined = VILLA_COMPLIANCE["489097"];
    const bunkRoom = combined.sleepingSpaces?.find((s) => s.label === "Bunk bed room (Unit 119)");
    expect(bunkRoom?.guests).toBe(4);
    expect(bunkRoom?.adults).toBe(2);
    expect(bunkRoom?.children).toBe(2);
  });

  it("never lets a room anywhere house more than 2 adults", () => {
    for (const details of Object.values(VILLA_COMPLIANCE)) {
      for (const space of details.sleepingSpaces ?? []) {
        if (space.adults != null) {
          expect(space.adults).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  it("never counts a living area toward a bedroom count", () => {
    // Villa 111 and Villa 120 each have exactly one living-area sleeping
    // space (a sofa bed) that must not inflate their bedroom count.
    const villa111 = VILLA_COMPLIANCE["489093"];
    const villa120 = VILLA_COMPLIANCE["489092"];
    expect(countBedroomSpaces(villa111)).toBe(3);
    expect(countBedroomSpaces(villa120)).toBe(1);
    expect(villa111.sleepingSpaces?.some((s) => s.type === "living_area")).toBe(true);
    expect(villa120.sleepingSpaces?.some((s) => s.type === "living_area")).toBe(true);
  });

  it("never lets VILLA_STAT_OVERRIDES.maxGuests drift from the compliance-mandated licensed maximum", () => {
    for (const [id, details] of Object.entries(VILLA_COMPLIANCE)) {
      expect(VILLA_STAT_OVERRIDES[id]?.maxGuests).toBe(details.licensedMaxOccupancy);
    }
  });

  it("never lets a licensed maximum exceed physical sleeping capacity", () => {
    for (const details of Object.values(VILLA_COMPLIANCE)) {
      if (!details.sleepingSpaces) continue;
      expect(details.licensedMaxOccupancy).toBeLessThanOrEqual(getPhysicalSleepingCapacity(details));
    }
  });

  it("represents every 4-guest sleeping space, in every villa, as exactly 2 adults + 2 children — never 4 undifferentiated adults", () => {
    // Myra's explicit rule: "Di kasi pwede mag-exceed sa 2 adults per
    // bedroom." A future edit that adds a new 4-guest room without this
    // composition should fail here, not just pass silently.
    for (const details of Object.values(VILLA_COMPLIANCE)) {
      for (const space of details.sleepingSpaces ?? []) {
        if (space.guests === 4) {
          expect(space.adults, `${details.unit}: "${space.label}"`).toBe(2);
          expect(space.children, `${details.unit}: "${space.label}"`).toBe(2);
        }
      }
    }
  });
});

import { describe, it, expect } from "vitest";
import type { AppProfileEntry, AppProfileData } from "../../types/expression";

describe("AppProfileData types", () => {
  it("supports preset-sourced entries", () => {
    const entry: AppProfileEntry = { value: "Engineering", source: "preset" };
    expect(entry.value).toBe("Engineering");
    expect(entry.source).toBe("preset");
  });

  it("supports custom-sourced entries", () => {
    const entry: AppProfileEntry = { value: "custom-val", source: "custom" };
    expect(entry.source).toBe("custom");
  });

  it("supports AppProfileData as a record", () => {
    const profile: AppProfileData = {
      department: { value: "Engineering", source: "preset" },
      customField: { value: "test", source: "custom" },
    };
    expect(profile.department.value).toBe("Engineering");
    expect(profile.customField.source).toBe("custom");
  });
});

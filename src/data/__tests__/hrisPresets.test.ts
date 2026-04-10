import { describe, it, expect } from "vitest";
import type { AppProfileEntry, AppProfileData } from "../../types/expression";
import { hrisPresets, type HrisPreset } from "../hrisPresets";

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

describe("hrisPresets", () => {
  it("exports 5 presets", () => {
    expect(hrisPresets).toHaveLength(5);
  });

  it("each preset has id, name, and non-empty attributes", () => {
    for (const preset of hrisPresets) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(Object.keys(preset.attributes).length).toBeGreaterThan(0);
    }
  });

  it("includes Workday preset with expected attributes", () => {
    const workday = hrisPresets.find((p) => p.id === "workday");
    expect(workday).toBeDefined();
    expect(workday!.attributes.workerID).toBeDefined();
    expect(workday!.attributes.department).toBeDefined();
    expect(workday!.attributes.employeeID).toBeDefined();
  });

  it("includes BambooHR preset", () => {
    const bamboo = hrisPresets.find((p) => p.id === "bamboohr");
    expect(bamboo).toBeDefined();
    expect(bamboo!.attributes.employeeId).toBeDefined();
  });

  it("includes SAP SuccessFactors preset", () => {
    const sap = hrisPresets.find((p) => p.id === "successfactors");
    expect(sap).toBeDefined();
    expect(sap!.attributes.personIdExternal).toBeDefined();
  });

  it("includes UKG Pro preset", () => {
    const ukg = hrisPresets.find((p) => p.id === "ukgpro");
    expect(ukg).toBeDefined();
    expect(ukg!.attributes.employeeId).toBeDefined();
  });

  it("includes Aquera (ADP) preset", () => {
    const aquera = hrisPresets.find((p) => p.id === "aquera");
    expect(aquera).toBeDefined();
    expect(aquera!.attributes.associateOID).toBeDefined();
  });

  it("all attribute values are strings", () => {
    for (const preset of hrisPresets) {
      for (const [, value] of Object.entries(preset.attributes)) {
        expect(typeof value).toBe("string");
      }
    }
  });
});

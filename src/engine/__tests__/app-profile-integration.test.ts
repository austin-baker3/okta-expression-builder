import { describe, it, expect } from "vitest";
import { parse } from "../parser";
import { evaluate } from "../evaluator";
import { validate } from "../validator";
import type { AppProfileData } from "../../types/expression";

const userProfile = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@acme.com",
  department: "Engineering",
};

const appProfile: AppProfileData = {
  department: { value: "HR Systems", source: "preset" },
  workerID: { value: "WD-100042", source: "preset" },
  hireDate: { value: "2022-03-15", source: "preset" },
  customField: { value: "custom-value", source: "custom" },
};

describe("integration: app profile end-to-end", () => {
  it("parses and evaluates app.department", () => {
    const tree = parse("app.department");
    expect(validate(tree)).toEqual([]);
    const result = evaluate(tree, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "HR Systems" });
  });

  it("parses and evaluates appuser.workerID", () => {
    const tree = parse("appuser.workerID");
    const result = evaluate(tree, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "WD-100042" });
  });

  it("user.department and app.department are different values", () => {
    const userTree = parse("user.department");
    const appTree = parse("app.department");
    const userResult = evaluate(userTree, userProfile, appProfile);
    const appResult = evaluate(appTree, userProfile, appProfile);
    expect(userResult).toEqual({ ok: true, value: "Engineering" });
    expect(appResult).toEqual({ ok: true, value: "HR Systems" });
  });

  it("concatenates user and app attributes", () => {
    const tree = parse('user.firstName + " (ID: " + app.workerID + ")"');
    const result = evaluate(tree, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "Jane (ID: WD-100042)" });
  });

  it("ternary with app attribute", () => {
    const tree = parse('app.workerID != null ? app.workerID : "unknown"');
    const result = evaluate(tree, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "WD-100042" });
  });

  it("function with app attribute argument", () => {
    const tree = parse("String.toUpperCase(app.department)");
    const result = evaluate(tree, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "HR SYSTEMS" });
  });

  it("custom app field resolves correctly", () => {
    const tree = parse("app.customField");
    const result = evaluate(tree, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "custom-value" });
  });
});

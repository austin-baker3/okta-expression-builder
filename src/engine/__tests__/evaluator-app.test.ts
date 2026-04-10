import { describe, it, expect } from "vitest";
import { evaluate } from "../evaluator";
import type { ExpressionNode, AppProfileData } from "../../types/expression";

const userProfile = { firstName: "Jane", lastName: "Doe", email: "jane@acme.com" };
const appProfile: AppProfileData = {
  department: { value: "Engineering", source: "preset" },
  jobTitle: { value: "Software Engineer", source: "preset" },
};

describe("evaluator app profile", () => {
  it("resolves app.* from app profile", () => {
    const node: ExpressionNode = { type: "attribute", path: "app.department" };
    const result = evaluate(node, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "Engineering" });
  });

  it("resolves appuser.* from app profile", () => {
    const node: ExpressionNode = { type: "attribute", path: "appuser.jobTitle" };
    const result = evaluate(node, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "Software Engineer" });
  });

  it("still resolves user.* from user profile", () => {
    const node: ExpressionNode = { type: "attribute", path: "user.firstName" };
    const result = evaluate(node, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "Jane" });
  });

  it("returns null for missing app attribute", () => {
    const node: ExpressionNode = { type: "attribute", path: "app.nonexistent" };
    const result = evaluate(node, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: null });
  });

  it("evaluates mixed expression with user and app attributes", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "+",
      operands: [
        { type: "attribute", path: "user.firstName" },
        {
          type: "operator",
          operator: "+",
          operands: [
            { type: "literal", value: " works in " },
            { type: "attribute", path: "app.department" },
          ],
        },
      ],
    };
    const result = evaluate(node, userProfile, appProfile);
    expect(result).toEqual({ ok: true, value: "Jane works in Engineering" });
  });

  it("works with empty app profile (backward compat)", () => {
    const node: ExpressionNode = { type: "attribute", path: "app.department" };
    const result = evaluate(node, userProfile, {});
    expect(result).toEqual({ ok: true, value: null });
  });

  it("works when appProfile is undefined (backward compat)", () => {
    const node: ExpressionNode = { type: "attribute", path: "user.firstName" };
    const result = evaluate(node, userProfile);
    expect(result).toEqual({ ok: true, value: "Jane" });
  });
});

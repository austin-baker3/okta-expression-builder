import { describe, it, expect } from "vitest";
import { serialize } from "../serializer";
import { validate } from "../validator";
import { evaluate } from "../evaluator";
import type { ExpressionNode } from "../../types/expression";

describe("array literal support", () => {
  const arrayNode: ExpressionNode = {
    type: "array",
    elements: [
      { type: "literal", value: "a" },
      { type: "literal", value: "b" },
    ],
  };

  const emptyArrayNode: ExpressionNode = {
    type: "array",
    elements: [],
  };

  describe("serializer", () => {
    it("serializes array literal", () => {
      expect(serialize(arrayNode)).toBe('{"a", "b"}');
    });

    it("serializes empty array literal", () => {
      expect(serialize(emptyArrayNode)).toBe("{}");
    });
  });

  describe("validator", () => {
    it("validates array literal with no errors", () => {
      expect(validate(arrayNode)).toEqual([]);
    });

    it("validates nested errors in array elements", () => {
      const badArray: ExpressionNode = {
        type: "array",
        elements: [
          { type: "attribute", path: "" },
        ],
      };
      const errors = validate(badArray);
      expect(errors.length).toBe(1);
      expect(errors[0].message).toContain("empty");
    });
  });

  describe("evaluator", () => {
    it("evaluates array literal to string array", () => {
      const result = evaluate(arrayNode, {});
      expect(result).toEqual({ ok: true, value: ["a", "b"] });
    });

    it("evaluates empty array literal", () => {
      const result = evaluate(emptyArrayNode, {});
      expect(result).toEqual({ ok: true, value: [] });
    });
  });
});

describe("arithmetic operator evaluation", () => {
  it("evaluates subtraction", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "-",
      operands: [
        { type: "literal", value: 10 },
        { type: "literal", value: 3 },
      ],
    };
    expect(evaluate(node, {})).toEqual({ ok: true, value: 7 });
  });

  it("evaluates multiplication", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "*",
      operands: [
        { type: "literal", value: 4 },
        { type: "literal", value: 5 },
      ],
    };
    expect(evaluate(node, {})).toEqual({ ok: true, value: 20 });
  });

  it("evaluates division", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "/",
      operands: [
        { type: "literal", value: 20 },
        { type: "literal", value: 4 },
      ],
    };
    expect(evaluate(node, {})).toEqual({ ok: true, value: 5 });
  });

  it("handles division by zero", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "/",
      operands: [
        { type: "literal", value: 10 },
        { type: "literal", value: 0 },
      ],
    };
    expect(evaluate(node, {})).toEqual({ ok: false, error: "Division by zero" });
  });
});

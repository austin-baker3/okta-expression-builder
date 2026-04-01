import { describe, it, expect } from "vitest";
import { validate } from "../../src/engine/validator";
import type { ExpressionNode } from "../../src/types/expression";

describe("validate", () => {
  it("returns no errors for a valid literal", () => {
    const node: ExpressionNode = { type: "literal", value: "hello" };
    expect(validate(node)).toEqual([]);
  });

  it("returns no errors for a valid attribute reference", () => {
    const node: ExpressionNode = { type: "attribute", path: "user.email" };
    expect(validate(node)).toEqual([]);
  });

  it("returns error for empty attribute path", () => {
    const node: ExpressionNode = { type: "attribute", path: "" };
    const errors = validate(node);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("empty");
  });

  it("returns error for unknown function name", () => {
    const node: ExpressionNode = {
      type: "function",
      name: "String.doesNotExist",
      arguments: [{ type: "literal", value: "test" }],
    };
    const errors = validate(node);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("Unknown function");
  });

  it("returns no errors for a valid function call", () => {
    const node: ExpressionNode = {
      type: "function",
      name: "String.toUpperCase",
      arguments: [{ type: "attribute", path: "user.email" }],
    };
    expect(validate(node)).toEqual([]);
  });

  it("returns error for missing required arguments", () => {
    const node: ExpressionNode = {
      type: "function",
      name: "String.substringBefore",
      arguments: [{ type: "attribute", path: "user.email" }],
    };
    const errors = validate(node);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("requires 2");
  });

  it("returns error for incomplete ternary operator", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "?:",
      operands: [
        { type: "literal", value: true },
        { type: "literal", value: "yes" },
      ],
    };
    const errors = validate(node);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("3 operands");
  });

  it("returns error for binary operator with wrong operand count", () => {
    const node: ExpressionNode = {
      type: "operator",
      operator: "==",
      operands: [{ type: "literal", value: 1 }],
    };
    const errors = validate(node);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("2 operands");
  });

  it("validates nested expressions recursively", () => {
    const node: ExpressionNode = {
      type: "function",
      name: "String.toUpperCase",
      arguments: [
        {
          type: "function",
          name: "String.doesNotExist",
          arguments: [],
        },
      ],
    };
    const errors = validate(node);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain("Unknown function");
  });

  it("validates group node contents", () => {
    const node: ExpressionNode = {
      type: "group",
      expression: { type: "attribute", path: "" },
    };
    const errors = validate(node);
    expect(errors.length).toBe(1);
  });
});

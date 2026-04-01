import { describe, it, expect } from "vitest";
import { parse } from "../../src/engine/parser";
import { serialize } from "../../src/engine/serializer";
import type { ExpressionNode } from "../../src/types/expression";

describe("parse", () => {
  it("parses a string literal", () => {
    const result = parse('"hello"');
    expect(result).toEqual({ type: "literal", value: "hello" });
  });

  it("parses a number literal", () => {
    const result = parse("42");
    expect(result).toEqual({ type: "literal", value: 42 });
  });

  it("parses a boolean literal", () => {
    expect(parse("true")).toEqual({ type: "literal", value: true });
    expect(parse("false")).toEqual({ type: "literal", value: false });
  });

  it("parses null literal", () => {
    expect(parse("null")).toEqual({ type: "literal", value: null });
  });

  it("parses an attribute reference", () => {
    const result = parse("user.email");
    expect(result).toEqual({ type: "attribute", path: "user.email" });
  });

  it("parses a simple function call", () => {
    const result = parse("String.toUpperCase(user.email)");
    expect(result).toEqual({
      type: "function",
      name: "String.toUpperCase",
      arguments: [{ type: "attribute", path: "user.email" }],
    });
  });

  it("parses a function call with multiple arguments", () => {
    const result = parse('String.substringBefore(user.email, "@")');
    expect(result).toEqual({
      type: "function",
      name: "String.substringBefore",
      arguments: [
        { type: "attribute", path: "user.email" },
        { type: "literal", value: "@" },
      ],
    });
  });

  it("parses nested function calls", () => {
    const result = parse('String.toUpperCase(String.substringBefore(user.email, "@"))');
    expect(result).toEqual({
      type: "function",
      name: "String.toUpperCase",
      arguments: [
        {
          type: "function",
          name: "String.substringBefore",
          arguments: [
            { type: "attribute", path: "user.email" },
            { type: "literal", value: "@" },
          ],
        },
      ],
    });
  });

  it("parses a ternary operator", () => {
    const result = parse('user.email != null ? user.email : "default"');
    expect(result).toEqual({
      type: "operator",
      operator: "?:",
      operands: [
        {
          type: "operator",
          operator: "!=",
          operands: [
            { type: "attribute", path: "user.email" },
            { type: "literal", value: null },
          ],
        },
        { type: "attribute", path: "user.email" },
        { type: "literal", value: "default" },
      ],
    });
  });

  it("parses string concatenation", () => {
    const result = parse('user.firstName + " " + user.lastName');
    expect(result).toEqual({
      type: "operator",
      operator: "+",
      operands: [
        { type: "attribute", path: "user.firstName" },
        { type: "literal", value: " " },
        { type: "attribute", path: "user.lastName" },
      ],
    });
  });

  it("parses comparison operators", () => {
    const result = parse('user.department == "Engineering"');
    expect(result).toEqual({
      type: "operator",
      operator: "==",
      operands: [
        { type: "attribute", path: "user.department" },
        { type: "literal", value: "Engineering" },
      ],
    });
  });

  it("round-trips: parse then serialize produces original", () => {
    const expressions = [
      '"hello"',
      "42",
      "user.email",
      "String.toUpperCase(user.email)",
      'String.substringBefore(user.email, "@")',
      'String.toUpperCase(String.substringBefore(user.email, "@"))',
      'user.firstName + " " + user.lastName',
    ];
    for (const expr of expressions) {
      expect(serialize(parse(expr))).toBe(expr);
    }
  });

  it("parses parenthesized expressions", () => {
    const result = parse("(1 + 2)");
    expect(result).toEqual({
      type: "group",
      expression: {
        type: "operator",
        operator: "+",
        operands: [
          { type: "literal", value: 1 },
          { type: "literal", value: 2 },
        ],
      },
    });
  });

  it("throws on invalid input", () => {
    expect(() => parse("")).toThrow();
  });
});

import { describe, it, expect } from "vitest";
import { parse } from "../parser";
import type { ParseError } from "../../types/expression";

describe("parser", () => {
  describe("existing syntax (regression)", () => {
    it("parses string literals", () => {
      const result = parse('"hello"');
      expect(result).toEqual({ type: "literal", value: "hello" });
    });

    it("parses function calls", () => {
      const result = parse('String.toUpperCase("hello")');
      expect(result).toEqual({
        type: "function",
        name: "String.toUpperCase",
        arguments: [{ type: "literal", value: "hello" }],
      });
    });

    it("parses ternary operator", () => {
      const result = parse("true ? 1 : 0");
      expect(result).toEqual({
        type: "operator",
        operator: "?:",
        operands: [
          { type: "literal", value: true },
          { type: "literal", value: 1 },
          { type: "literal", value: 0 },
        ],
      });
    });

    it("parses addition", () => {
      const result = parse("1 + 2");
      expect(result).toEqual({
        type: "operator",
        operator: "+",
        operands: [
          { type: "literal", value: 1 },
          { type: "literal", value: 2 },
        ],
      });
    });

    it("parses comparison operators", () => {
      const result = parse("1 == 2");
      expect(result).toEqual({
        type: "operator",
        operator: "==",
        operands: [
          { type: "literal", value: 1 },
          { type: "literal", value: 2 },
        ],
      });
    });

    it("parses logical AND/OR", () => {
      const result = parse("true AND false");
      expect(result).toEqual({
        type: "operator",
        operator: "AND",
        operands: [
          { type: "literal", value: true },
          { type: "literal", value: false },
        ],
      });
    });

    it("parses attribute references", () => {
      const result = parse("user.email");
      expect(result).toEqual({ type: "attribute", path: "user.email" });
    });

    it("parses grouped expressions", () => {
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

    it("parses NOT / ! operators", () => {
      const result = parse("!true");
      expect(result).toEqual({
        type: "operator",
        operator: "!",
        operands: [{ type: "literal", value: true }],
      });
    });

    it("parses null literal", () => {
      const result = parse("null");
      expect(result).toEqual({ type: "literal", value: null });
    });
  });

  describe("arithmetic operators", () => {
    it("parses subtraction", () => {
      const result = parse("10 - 3");
      expect(result).toEqual({
        type: "operator",
        operator: "-",
        operands: [
          { type: "literal", value: 10 },
          { type: "literal", value: 3 },
        ],
      });
    });

    it("parses multiplication", () => {
      const result = parse("4 * 5");
      expect(result).toEqual({
        type: "operator",
        operator: "*",
        operands: [
          { type: "literal", value: 4 },
          { type: "literal", value: 5 },
        ],
      });
    });

    it("parses division", () => {
      const result = parse("20 / 4");
      expect(result).toEqual({
        type: "operator",
        operator: "/",
        operands: [
          { type: "literal", value: 20 },
          { type: "literal", value: 4 },
        ],
      });
    });

    it("respects precedence: multiplication before addition", () => {
      const result = parse("2 + 3 * 4");
      expect(result).toEqual({
        type: "operator",
        operator: "+",
        operands: [
          { type: "literal", value: 2 },
          {
            type: "operator",
            operator: "*",
            operands: [
              { type: "literal", value: 3 },
              { type: "literal", value: 4 },
            ],
          },
        ],
      });
    });

    it("respects precedence: division before subtraction", () => {
      const result = parse("10 - 6 / 2");
      expect(result).toEqual({
        type: "operator",
        operator: "-",
        operands: [
          { type: "literal", value: 10 },
          {
            type: "operator",
            operator: "/",
            operands: [
              { type: "literal", value: 6 },
              { type: "literal", value: 2 },
            ],
          },
        ],
      });
    });

    it("distinguishes negative number from subtraction", () => {
      const result = parse("-5");
      expect(result).toEqual({ type: "literal", value: -5 });
    });

    it("parses subtraction after value, not as negative number", () => {
      const result = parse("10 - 5");
      expect(result).toEqual({
        type: "operator",
        operator: "-",
        operands: [
          { type: "literal", value: 10 },
          { type: "literal", value: 5 },
        ],
      });
    });
  });

  describe("single-quoted strings", () => {
    it("parses single-quoted string", () => {
      const result = parse("'hello'");
      expect(result).toEqual({ type: "literal", value: "hello" });
    });

    it("parses single-quoted string with escape", () => {
      const result = parse("'it\\'s'");
      expect(result).toEqual({ type: "literal", value: "it's" });
    });

    it("parses single-quoted string in function call", () => {
      const result = parse("String.toUpperCase('hello')");
      expect(result).toEqual({
        type: "function",
        name: "String.toUpperCase",
        arguments: [{ type: "literal", value: "hello" }],
      });
    });
  });

  describe("structured parse errors", () => {
    it("provides position and length for unexpected character", () => {
      try {
        parse("user.email @@ something");
        expect.fail("should have thrown");
      } catch (e) {
        const err = e as ParseError;
        expect(err.message).toContain("Unexpected");
        expect(err.position).toBe(11);
        expect(err.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("provides position for unclosed string", () => {
      try {
        parse('"hello');
        expect.fail("should have thrown");
      } catch (e) {
        const err = e as ParseError;
        expect(err.position).toBeDefined();
        expect(typeof err.position).toBe("number");
      }
    });

    it("provides position for missing closing paren", () => {
      try {
        parse("String.toUpperCase(user.email");
        expect.fail("should have thrown");
      } catch (e) {
        const err = e as ParseError;
        expect(err.message).toContain(")");
        expect(err.position).toBeDefined();
      }
    });

    it("single quotes work correctly (not an error)", () => {
      const result = parse("'hello'");
      expect(result).toEqual({ type: "literal", value: "hello" });
    });

    it("provides position for trailing characters", () => {
      try {
        parse("user.email user.name");
        expect.fail("should have thrown");
      } catch (e) {
        const err = e as ParseError;
        expect(err.position).toBe(11);
        expect(err.message).toContain("Unexpected");
      }
    });
  });

  describe("array literals", () => {
    it("parses array literal with strings", () => {
      const result = parse('{"a", "b", "c"}');
      expect(result).toEqual({
        type: "array",
        elements: [
          { type: "literal", value: "a" },
          { type: "literal", value: "b" },
          { type: "literal", value: "c" },
        ],
      });
    });

    it("parses empty array literal", () => {
      const result = parse("{}");
      expect(result).toEqual({ type: "array", elements: [] });
    });

    it("parses array literal with mixed types", () => {
      const result = parse('{"hello", 42, true}');
      expect(result).toEqual({
        type: "array",
        elements: [
          { type: "literal", value: "hello" },
          { type: "literal", value: 42 },
          { type: "literal", value: true },
        ],
      });
    });
  });
});

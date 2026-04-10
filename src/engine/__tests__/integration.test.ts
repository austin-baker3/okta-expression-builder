import { describe, it, expect } from "vitest";
import { parse } from "../parser";
import { serialize } from "../serializer";
import { validate } from "../validator";
import { evaluate } from "../evaluator";
import type { ParseError } from "../../types/expression";

describe("integration: parse → serialize round-trip", () => {
  const expressions = [
    '"hello"',
    "user.email",
    'String.toUpperCase("hello")',
    "1 + 2",
    "10 - 3",
    "4 * 5",
    "20 / 4",
    "2 + 3 * 4",
    "true ? 1 : 0",
    "!true",
    '{"a", "b", "c"}',
    "'single quoted'",
  ];

  for (const expr of expressions) {
    it(`round-trips: ${expr}`, () => {
      const tree = parse(expr);
      const serialized = serialize(tree);
      const reparsed = parse(serialized);
      expect(reparsed).toEqual(tree);
    });
  }
});

describe("integration: parse → validate → evaluate", () => {
  it("evaluates arithmetic expression", () => {
    const tree = parse("2 + 3 * 4");
    expect(validate(tree)).toEqual([]);
    const result = evaluate(tree, {});
    expect(result).toEqual({ ok: true, value: 14 });
  });

  it("evaluates subtraction", () => {
    const tree = parse("10 - 3");
    const result = evaluate(tree, {});
    expect(result).toEqual({ ok: true, value: 7 });
  });

  it("evaluates division", () => {
    const tree = parse("20 / 4");
    const result = evaluate(tree, {});
    expect(result).toEqual({ ok: true, value: 5 });
  });

  it("evaluates array literal", () => {
    const tree = parse('{"hello", "world"}');
    const result = evaluate(tree, {});
    expect(result).toEqual({ ok: true, value: ["hello", "world"] });
  });

  it("handles division by zero", () => {
    const tree = parse("10 / 0");
    const result = evaluate(tree, {});
    expect(result).toEqual({ ok: false, error: "Division by zero" });
  });
});

describe("integration: structured parse errors", () => {
  it("gives position for unexpected trailing content", () => {
    try {
      parse("user.email something");
      expect.fail("should throw");
    } catch (e) {
      const err = e as ParseError;
      expect(err.position).toBe(11);
      expect(err.length).toBe(9);
      expect(err.message).toContain("Unexpected");
    }
  });

  it("gives position for missing close paren", () => {
    try {
      parse("String.toUpperCase(user.email");
      expect.fail("should throw");
    } catch (e) {
      const err = e as ParseError;
      expect(err.position).toBeDefined();
      expect(err.message).toContain(")");
    }
  });
});

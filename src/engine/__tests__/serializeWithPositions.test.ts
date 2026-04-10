import { describe, it, expect } from "vitest";
import { serializeWithPositions } from "../serializeWithPositions";
import type { ExpressionNode } from "../../types/expression";

describe("serializeWithPositions", () => {
  it("maps root node to full range", () => {
    const node: ExpressionNode = { type: "literal", value: "hello" };
    const result = serializeWithPositions(node);
    expect(result.text).toBe('"hello"');
    expect(result.positions.get(node)).toEqual({ start: 0, end: 7 });
  });

  it("maps function call and its arguments", () => {
    const arg: ExpressionNode = { type: "literal", value: "test" };
    const node: ExpressionNode = {
      type: "function",
      name: "String.toUpperCase",
      arguments: [arg],
    };
    const result = serializeWithPositions(node);
    expect(result.text).toBe('String.toUpperCase("test")');
    expect(result.positions.get(node)).toEqual({ start: 0, end: 26 });
    expect(result.positions.get(arg)).toEqual({ start: 19, end: 25 });
  });

  it("maps operator operands", () => {
    const left: ExpressionNode = { type: "literal", value: 1 };
    const right: ExpressionNode = { type: "literal", value: 2 };
    const node: ExpressionNode = {
      type: "operator",
      operator: "+",
      operands: [left, right],
    };
    const result = serializeWithPositions(node);
    expect(result.text).toBe("1 + 2");
    expect(result.positions.get(left)).toEqual({ start: 0, end: 1 });
    expect(result.positions.get(right)).toEqual({ start: 4, end: 5 });
  });

  it("maps array literal elements", () => {
    const el1: ExpressionNode = { type: "literal", value: "a" };
    const el2: ExpressionNode = { type: "literal", value: "b" };
    const node: ExpressionNode = { type: "array", elements: [el1, el2] };
    const result = serializeWithPositions(node);
    expect(result.text).toBe('{"a", "b"}');
    expect(result.positions.get(el1)).toEqual({ start: 1, end: 4 });
    expect(result.positions.get(el2)).toEqual({ start: 6, end: 9 });
  });

  it("resolves path to position", () => {
    const arg: ExpressionNode = { type: "literal", value: "test" };
    const node: ExpressionNode = {
      type: "function",
      name: "String.toUpperCase",
      arguments: [arg],
    };
    const result = serializeWithPositions(node);
    expect(result.resolvePathToPosition([0])).toEqual({ start: 19, end: 25 });
  });
});

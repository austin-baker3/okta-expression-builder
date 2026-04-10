import type { ExpressionNode, ParseError } from "../types/expression";

export function parse(input: string): ExpressionNode {
  const trimmed = input.trim();
  if (!trimmed) {
    const err = new Error("Empty expression") as Error & ParseError;
    err.position = 0;
    err.length = 1;
    throw err;
  }

  const parser = new Parser(trimmed);
  const result = parser.parseExpression();
  parser.skipWhitespace();
  if (parser.pos < parser.input.length) {
    throw parser.error(
      `Unexpected characters at position ${parser.pos}`,
      parser.pos,
      parser.input.length - parser.pos
    );
  }
  return result;
}

class Parser {
  input: string;
  pos: number;

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
  }

  error(message: string, position: number, length: number = 1, hint?: string): Error & ParseError {
    const err = new Error(message) as Error & ParseError;
    err.position = position;
    err.length = length;
    if (hint) err.hint = hint;
    return err;
  }

  parseExpression(): ExpressionNode {
    const left = this.parseTernary();
    return left;
  }

  parseTernary(): ExpressionNode {
    const left = this.parseOr();
    this.skipWhitespace();
    if (this.peek() === "?") {
      this.pos++;
      this.skipWhitespace();
      const trueExpr = this.parseTernary();
      this.skipWhitespace();
      this.expect(":");
      this.skipWhitespace();
      const falseExpr = this.parseTernary();
      return {
        type: "operator",
        operator: "?:",
        operands: [left, trueExpr, falseExpr],
      };
    }
    return left;
  }

  parseOr(): ExpressionNode {
    let left = this.parseAnd();
    this.skipWhitespace();
    while (this.matchKeyword("OR") || this.match("||")) {
      const op = this.input.substring(this.pos - 2, this.pos).trim();
      this.skipWhitespace();
      const right = this.parseAnd();
      left = { type: "operator", operator: op === "||" ? "||" : "OR", operands: [left, right] };
      this.skipWhitespace();
    }
    return left;
  }

  parseAnd(): ExpressionNode {
    let left = this.parseComparison();
    this.skipWhitespace();
    while (this.matchKeyword("AND") || this.match("&&")) {
      const op = this.input.substring(this.pos - 2, this.pos).includes("&") ? "&&" : "AND";
      this.skipWhitespace();
      const right = this.parseComparison();
      left = { type: "operator", operator: op, operands: [left, right] };
      this.skipWhitespace();
    }
    return left;
  }

  parseComparison(): ExpressionNode {
    let left = this.parseAddSub();
    this.skipWhitespace();
    const ops = ["==", "!=", ">=", "<=", ">", "<"];
    for (const op of ops) {
      if (this.match(op)) {
        this.skipWhitespace();
        const right = this.parseAddSub();
        left = { type: "operator", operator: op, operands: [left, right] };
        this.skipWhitespace();
        break;
      }
    }
    return left;
  }

  parseAddSub(): ExpressionNode {
    let left = this.parseMulDiv();
    this.skipWhitespace();
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.input[this.pos];
      if (op === "-") {
        const before = this.input.substring(0, this.pos).trimEnd();
        const lastChar = before[before.length - 1];
        if (!/[a-zA-Z0-9_)"']/.test(lastChar)) break;
      }
      this.pos++;
      this.skipWhitespace();
      const right = this.parseMulDiv();
      left = { type: "operator", operator: op, operands: [left, right] };
      this.skipWhitespace();
    }
    return left;
  }

  parseMulDiv(): ExpressionNode {
    let left = this.parsePrimary();
    this.skipWhitespace();
    while (this.peek() === "*" || this.peek() === "/") {
      const op = this.input[this.pos];
      this.pos++;
      this.skipWhitespace();
      const right = this.parsePrimary();
      left = { type: "operator", operator: op, operands: [left, right] };
      this.skipWhitespace();
    }
    return left;
  }

  parsePrimary(): ExpressionNode {
    this.skipWhitespace();

    if (this.peek() === "(") {
      this.pos++;
      this.skipWhitespace();
      const expr = this.parseExpression();
      this.skipWhitespace();
      this.expect(")");
      return { type: "group", expression: expr };
    }

    if (this.peek() === "{") {
      return this.parseArrayLiteral();
    }

    if (this.peek() === '"') {
      return this.parseString();
    }

    if (this.peek() === "'") {
      return this.parseString("'");
    }

    if (this.peek() === "!") {
      this.pos++;
      this.skipWhitespace();
      const operand = this.parsePrimary();
      return { type: "operator", operator: "!", operands: [operand] };
    }

    if (this.matchKeyword("NOT")) {
      this.skipWhitespace();
      const operand = this.parsePrimary();
      return { type: "operator", operator: "NOT", operands: [operand] };
    }

    if (this.matchKeyword("true")) {
      return { type: "literal", value: true };
    }
    if (this.matchKeyword("false")) {
      return { type: "literal", value: false };
    }
    if (this.matchKeyword("null")) {
      return { type: "literal", value: null };
    }

    if (/[0-9\-]/.test(this.peek())) {
      return this.parseNumber();
    }

    return this.parseIdentifierOrFunctionCall();
  }

  parseString(quote: string = '"'): ExpressionNode {
    this.expect(quote);
    let value = "";
    while (this.pos < this.input.length && this.input[this.pos] !== quote) {
      if (this.input[this.pos] === "\\") {
        this.pos++;
        value += this.input[this.pos];
      } else {
        value += this.input[this.pos];
      }
      this.pos++;
    }
    this.expect(quote);
    return { type: "literal", value };
  }

  parseArrayLiteral(): ExpressionNode {
    this.expect("{");
    this.skipWhitespace();
    const elements: ExpressionNode[] = [];
    if (this.peek() !== "}") {
      elements.push(this.parseExpression());
      this.skipWhitespace();
      while (this.peek() === ",") {
        this.pos++;
        this.skipWhitespace();
        elements.push(this.parseExpression());
        this.skipWhitespace();
      }
    }
    this.expect("}");
    return { type: "array", elements };
  }

  parseNumber(): ExpressionNode {
    const start = this.pos;
    if (this.peek() === "-") this.pos++;
    while (this.pos < this.input.length && /[0-9.]/.test(this.input[this.pos])) {
      this.pos++;
    }
    const numStr = this.input.substring(start, this.pos);
    const value = numStr.includes(".") ? parseFloat(numStr) : parseInt(numStr, 10);
    return { type: "literal", value };
  }

  parseIdentifierOrFunctionCall(): ExpressionNode {
    const start = this.pos;
    while (
      this.pos < this.input.length &&
      /[a-zA-Z0-9_.]/.test(this.input[this.pos])
    ) {
      this.pos++;
    }
    const name = this.input.substring(start, this.pos);
    if (!name) throw this.error(`Unexpected character at position ${this.pos}: '${this.peek()}'`, this.pos, 1);

    this.skipWhitespace();

    if (this.peek() === "(") {
      this.pos++;
      this.skipWhitespace();
      const args: ExpressionNode[] = [];
      if (this.peek() !== ")") {
        args.push(this.parseExpression());
        this.skipWhitespace();
        while (this.peek() === ",") {
          this.pos++;
          this.skipWhitespace();
          args.push(this.parseExpression());
          this.skipWhitespace();
        }
      }
      this.expect(")");
      return { type: "function", name, arguments: args };
    }

    if (name.startsWith("user.") || name.startsWith("app.") || name.startsWith("appuser.")) {
      return { type: "attribute", path: name };
    }

    return { type: "attribute", path: name };
  }

  peek(): string {
    return this.input[this.pos] || "";
  }

  match(str: string): boolean {
    if (this.input.substring(this.pos, this.pos + str.length) === str) {
      this.pos += str.length;
      return true;
    }
    return false;
  }

  matchKeyword(keyword: string): boolean {
    const end = this.pos + keyword.length;
    if (
      this.input.substring(this.pos, end) === keyword &&
      (end >= this.input.length || !/[a-zA-Z0-9_]/.test(this.input[end]))
    ) {
      this.pos = end;
      return true;
    }
    return false;
  }

  expect(char: string): void {
    if (this.input[this.pos] !== char) {
      throw this.error(
        `Expected '${char}' at position ${this.pos}, got '${this.input[this.pos] || "EOF"}'`,
        this.pos,
        1,
        char === ")" ? "Check for missing closing parenthesis" :
        char === '"' ? "Check for unclosed string literal" :
        char === "'" ? "Check for unclosed string literal" :
        undefined
      );
    }
    this.pos++;
  }

  skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
}

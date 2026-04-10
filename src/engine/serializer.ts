import type { ExpressionNode } from "../types/expression";

const BINARY_OPERATORS = new Set([
  "+", "-", "*", "/",
  "==", "!=", ">", "<", ">=", "<=",
  "AND", "OR", "&&", "||",
]);

export function serialize(node: ExpressionNode): string {
  switch (node.type) {
    case "literal":
      if (node.value === null) return "null";
      if (typeof node.value === "string") return `"${node.value}"`;
      return String(node.value);

    case "attribute":
      return node.path;

    case "function":
      return `${node.name}(${node.arguments.map(serialize).join(", ")})`;

    case "operator":
      if (node.operator === "?:") {
        const [condition, trueExpr, falseExpr] = node.operands;
        return `${serialize(condition)} ? ${serialize(trueExpr)} : ${serialize(falseExpr)}`;
      }
      if (node.operator === "!") {
        return `!${serialize(node.operands[0])}`;
      }
      if (node.operator === "NOT") {
        return `NOT ${serialize(node.operands[0])}`;
      }
      if (BINARY_OPERATORS.has(node.operator)) {
        return node.operands.map(serialize).join(` ${node.operator} `);
      }
      return node.operands.map(serialize).join(` ${node.operator} `);

    case "array":
      return `{${node.elements.map(serialize).join(", ")}}`;

    case "group":
      return `(${serialize(node.expression)})`;
  }
}

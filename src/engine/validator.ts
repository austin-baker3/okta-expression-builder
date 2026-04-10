import type { ExpressionNode, ValidationError } from "../types/expression";
import { functionRegistry } from "../data/functionRegistry";

const BINARY_OPERATORS = new Set([
  "+", "-", "*", "/",
  "==", "!=", ">", "<", ">=", "<=",
  "AND", "OR", "&&", "||",
]);

const UNARY_OPERATORS = new Set(["!", "NOT"]);

const functionMap = new Map(functionRegistry.map((f) => [f.name, f]));

export function validate(
  node: ExpressionNode,
  path: number[] = []
): ValidationError[] {
  switch (node.type) {
    case "literal":
      return [];

    case "attribute":
      if (!node.path) {
        return [{ message: "Attribute path is empty", path }];
      }
      return [];

    case "group":
      return validate(node.expression, [...path, 0]);

    case "array": {
      const errors: ValidationError[] = [];
      for (let i = 0; i < node.elements.length; i++) {
        errors.push(...validate(node.elements[i], [...path, i]));
      }
      return errors;
    }

    case "function":
      return validateFunction(node.name, node.arguments, path);

    case "operator":
      return validateOperator(node.operator, node.operands, path);
  }
}

function validateFunction(
  name: string,
  args: ExpressionNode[],
  path: number[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const fn = functionMap.get(name);
  if (!fn) {
    errors.push({ message: `Unknown function: ${name}`, path });
    return errors;
  }

  const requiredCount = fn.parameters.filter((p) => p.required).length;
  if (args.length < requiredCount) {
    errors.push({
      message: `${name} requires ${requiredCount} argument(s), got ${args.length}`,
      path,
    });
  }

  for (let i = 0; i < args.length; i++) {
    errors.push(...validate(args[i], [...path, i]));
  }

  return errors;
}

function validateOperator(
  operator: string,
  operands: ExpressionNode[],
  path: number[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (operator === "?:") {
    if (operands.length !== 3) {
      errors.push({
        message: `Ternary operator requires 3 operands, got ${operands.length}`,
        path,
      });
    }
  } else if (UNARY_OPERATORS.has(operator)) {
    if (operands.length !== 1) {
      errors.push({
        message: `${operator} requires 1 operand, got ${operands.length}`,
        path,
      });
    }
  } else if (BINARY_OPERATORS.has(operator)) {
    if (operands.length < 2) {
      errors.push({
        message: `${operator} requires at least 2 operands, got ${operands.length}`,
        path,
      });
    }
  }

  for (let i = 0; i < operands.length; i++) {
    errors.push(...validate(operands[i], [...path, i]));
  }

  return errors;
}

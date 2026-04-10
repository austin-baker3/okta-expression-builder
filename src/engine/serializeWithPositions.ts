import type { ExpressionNode } from "../types/expression";

interface NodePosition {
  start: number;
  end: number;
}

interface SerializeResult {
  text: string;
  positions: Map<ExpressionNode, NodePosition>;
  resolvePathToPosition: (path: number[]) => NodePosition | null;
}

export function serializeWithPositions(root: ExpressionNode): SerializeResult {
  const positions = new Map<ExpressionNode, NodePosition>();
  let cursor = 0;
  let output = "";

  function emit(str: string): void {
    output += str;
    cursor += str.length;
  }

  function walk(node: ExpressionNode): void {
    const start = cursor;

    switch (node.type) {
      case "literal":
        if (node.value === null) emit("null");
        else if (typeof node.value === "string") emit(`"${node.value}"`);
        else emit(String(node.value));
        break;

      case "attribute":
        emit(node.path);
        break;

      case "function":
        emit(node.name);
        emit("(");
        for (let i = 0; i < node.arguments.length; i++) {
          if (i > 0) emit(", ");
          walk(node.arguments[i]);
        }
        emit(")");
        break;

      case "operator":
        if (node.operator === "?:") {
          walk(node.operands[0]);
          emit(" ? ");
          walk(node.operands[1]);
          emit(" : ");
          walk(node.operands[2]);
        } else if (node.operator === "!" || node.operator === "NOT") {
          emit(node.operator === "!" ? "!" : "NOT ");
          walk(node.operands[0]);
        } else {
          for (let i = 0; i < node.operands.length; i++) {
            if (i > 0) emit(` ${node.operator} `);
            walk(node.operands[i]);
          }
        }
        break;

      case "group":
        emit("(");
        walk(node.expression);
        emit(")");
        break;

      case "array":
        emit("{");
        for (let i = 0; i < node.elements.length; i++) {
          if (i > 0) emit(", ");
          walk(node.elements[i]);
        }
        emit("}");
        break;
    }

    positions.set(node, { start, end: cursor });
  }

  walk(root);

  function resolvePathToPosition(path: number[]): NodePosition | null {
    let current: ExpressionNode = root;
    for (const idx of path) {
      switch (current.type) {
        case "function":
          current = current.arguments[idx];
          break;
        case "operator":
          current = current.operands[idx];
          break;
        case "group":
          current = current.expression;
          break;
        case "array":
          current = current.elements[idx];
          break;
        default:
          return null;
      }
      if (!current) return null;
    }
    return positions.get(current) ?? null;
  }

  return { text: output, positions, resolvePathToPosition };
}

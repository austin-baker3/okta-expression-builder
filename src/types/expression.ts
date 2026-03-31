export interface FunctionCallNode {
  type: "function";
  name: string;
  arguments: ExpressionNode[];
}

export interface AttributeRefNode {
  type: "attribute";
  path: string;
}

export interface LiteralNode {
  type: "literal";
  value: string | number | boolean | null;
}

export interface OperatorNode {
  type: "operator";
  operator: string;
  operands: ExpressionNode[];
}

export interface GroupNode {
  type: "group";
  expression: ExpressionNode;
}

export type ExpressionNode =
  | FunctionCallNode
  | AttributeRefNode
  | LiteralNode
  | OperatorNode
  | GroupNode;

export interface ValidationError {
  message: string;
  path: number[];
  offset?: number;
}

export interface ELFunction {
  name: string;
  category: string;
  description: string;
  parameters: ELParameter[];
  returnType: string;
  example: string;
}

export interface ELParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export type ProfileData = Record<string, string | number | boolean | null | string[]>;

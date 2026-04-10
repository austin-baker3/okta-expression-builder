import type { ExpressionNode, ProfileData } from "../types/expression";

export type EvalResult =
  | { ok: true; value: string | number | boolean | null | string[] }
  | { ok: false; error: string };

const UNSUPPORTED_FUNCTIONS = new Set([
  "hasDirectoryUser",
  "findDirectoryUser",
  "getManagerUser",
  "getManagerUpn",
]);

export function evaluate(node: ExpressionNode, profile: ProfileData): EvalResult {
  switch (node.type) {
    case "literal":
      return { ok: true, value: node.value };

    case "attribute": {
      const key = node.path.replace(/^user\./, "");
      const value = key in profile ? profile[key] : null;
      return { ok: true, value };
    }

    case "group":
      return evaluate(node.expression, profile);

    case "array": {
      const results = node.elements.map((el) => evaluate(el, profile));
      for (const r of results) {
        if (!r.ok) return r;
      }
      const values = results.map((r) => (r as { ok: true; value: unknown }).value);
      return { ok: true, value: values.map(String) };
    }

    case "function":
      return evaluateFunction(node.name, node.arguments, profile);

    case "operator":
      return evaluateOperator(node.operator, node.operands, profile);
  }
}

function evaluateFunction(
  name: string,
  args: ExpressionNode[],
  profile: ProfileData
): EvalResult {
  if (UNSUPPORTED_FUNCTIONS.has(name)) {
    return { ok: false, error: `${name}() cannot be evaluated locally — requires live Okta context` };
  }

  const evalArgs = args.map((a) => evaluate(a, profile));
  for (const r of evalArgs) {
    if (!r.ok) return r;
  }
  const values = evalArgs.map((r) => (r as { ok: true; value: unknown }).value);

  switch (name) {
    case "String.toUpperCase":
      return { ok: true, value: String(values[0]).toUpperCase() };
    case "String.toLowerCase":
      return { ok: true, value: String(values[0]).toLowerCase() };
    case "String.substringBefore": {
      const src = String(values[0]);
      const sep = String(values[1]);
      const idx = src.indexOf(sep);
      return { ok: true, value: idx === -1 ? src : src.substring(0, idx) };
    }
    case "String.substringAfter": {
      const src = String(values[0]);
      const sep = String(values[1]);
      const idx = src.indexOf(sep);
      return { ok: true, value: idx === -1 ? src : src.substring(idx + sep.length) };
    }
    case "String.stringContains":
      return { ok: true, value: String(values[0]).includes(String(values[1])) };
    case "String.append":
      return { ok: true, value: String(values[0]) + String(values[1]) };
    case "String.replace":
      return {
        ok: true,
        value: String(values[0]).replaceAll(String(values[1]), String(values[2])),
      };
    case "String.replaceFirst":
      return {
        ok: true,
        value: String(values[0]).replace(String(values[1]), String(values[2])),
      };
    case "String.len":
      return { ok: true, value: String(values[0]).length };
    case "String.removeSpaces":
      return { ok: true, value: String(values[0]).replaceAll(" ", "") };
    case "String.substring":
      return {
        ok: true,
        value: String(values[0]).substring(Number(values[1]), Number(values[2])),
      };
    case "String.regexMatch":
      try {
        return { ok: true, value: new RegExp(String(values[1])).test(String(values[0])) };
      } catch {
        return { ok: false, error: `Invalid regex: ${values[1]}` };
      }
    case "String.stringSwitch": {
      const src = String(values[0]);
      const defaultVal = String(values[1]);
      for (let i = 2; i < values.length - 1; i += 2) {
        if (src === String(values[i])) {
          return { ok: true, value: String(values[i + 1]) };
        }
      }
      return { ok: true, value: defaultVal };
    }
    case "Convert.toInt":
      return { ok: true, value: parseInt(String(values[0]), 10) };
    case "Convert.toNum":
      return { ok: true, value: parseFloat(String(values[0])) };
    case "Arrays.size":
      return { ok: true, value: Array.isArray(values[0]) ? values[0].length : 0 };
    case "Arrays.isEmpty":
      return { ok: true, value: !Array.isArray(values[0]) || values[0].length === 0 };
    case "Arrays.contains":
      return {
        ok: true,
        value: Array.isArray(values[0]) && values[0].includes(String(values[1])),
      };
    case "Arrays.get":
      return {
        ok: true,
        value: Array.isArray(values[0]) ? (values[0][Number(values[1])] ?? null) : null,
      };
    case "Arrays.toCsvString":
    case "Arrays.toCommaSeparatedString":
      return { ok: true, value: Array.isArray(values[0]) ? values[0].join(",") : "" };
    case "Arrays.add":
      return {
        ok: true,
        value: Array.isArray(values[0]) ? [...values[0], String(values[1])] : [String(values[1])],
      };
    case "Arrays.remove":
      return {
        ok: true,
        value: Array.isArray(values[0])
          ? values[0].filter((v) => v !== String(values[1]))
          : [],
      };
    case "Arrays.clear":
      return { ok: true, value: [] };
    case "Arrays.flatten":
      return { ok: true, value: Array.isArray(values[0]) ? values[0].flat() : [] };
    case "Time.now":
      return { ok: true, value: new Date().toISOString() };
    case "Time.delta": {
      const d = new Date();
      d.setDate(d.getDate() + Number(values[0]));
      return { ok: true, value: d.toISOString() };
    }
    default:
      return { ok: false, error: `Unsupported function: ${name}` };
  }
}

function evaluateOperator(
  operator: string,
  operands: ExpressionNode[],
  profile: ProfileData
): EvalResult {
  if (operator === "?:") {
    const condResult = evaluate(operands[0], profile);
    if (!condResult.ok) return condResult;
    return condResult.value ? evaluate(operands[1], profile) : evaluate(operands[2], profile);
  }

  const evalOps = operands.map((o) => evaluate(o, profile));
  for (const r of evalOps) {
    if (!r.ok) return r;
  }
  const values = evalOps.map((r) => (r as { ok: true; value: unknown }).value);

  switch (operator) {
    case "+": {
      const allNumbers = values.every((v) => typeof v === "number");
      if (allNumbers) {
        return { ok: true, value: (values as number[]).reduce((a, b) => a + b, 0) };
      }
      return { ok: true, value: values.map(String).join("") };
    }
    case "-":
      return { ok: true, value: (values[0] as number) - (values[1] as number) };
    case "*":
      return { ok: true, value: (values[0] as number) * (values[1] as number) };
    case "/": {
      if ((values[1] as number) === 0) {
        return { ok: false, error: "Division by zero" };
      }
      return { ok: true, value: (values[0] as number) / (values[1] as number) };
    }
    case "==":
      return { ok: true, value: values[0] === values[1] };
    case "!=":
      return { ok: true, value: values[0] !== values[1] };
    case ">":
      return { ok: true, value: (values[0] as number) > (values[1] as number) };
    case "<":
      return { ok: true, value: (values[0] as number) < (values[1] as number) };
    case ">=":
      return { ok: true, value: (values[0] as number) >= (values[1] as number) };
    case "<=":
      return { ok: true, value: (values[0] as number) <= (values[1] as number) };
    case "AND":
    case "&&":
      return { ok: true, value: values.every(Boolean) };
    case "OR":
    case "||":
      return { ok: true, value: values.some(Boolean) };
    case "!":
    case "NOT":
      return { ok: true, value: !values[0] };
    default:
      return { ok: false, error: `Unknown operator: ${operator}` };
  }
}

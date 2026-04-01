import type { ExpressionNode } from "../types/expression";

interface ArgumentSlotProps {
  node: ExpressionNode | null;
  paramName: string;
  paramType: string;
  onOpen: () => void;
  onClear: () => void;
  onNodeOpen: (node: ExpressionNode) => void;
}

export default function ArgumentSlot({
  node,
  paramName,
  paramType,
  onOpen,
  onClear,
  onNodeOpen: _onNodeOpen,
}: ArgumentSlotProps) {
  if (!node) {
    return (
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-dashed border-slate-600 text-slate-500 text-xs hover:border-violet-500 hover:text-violet-400 transition-colors"
      >
        <span className="text-violet-500">+</span>
        <span>
          {paramName}: {paramType}
        </span>
      </button>
    );
  }

  const renderInline = () => {
    switch (node.type) {
      case "literal":
        return (
          <span className="text-amber-400 font-mono text-xs">
            {node.value === null ? "null" : typeof node.value === "string" ? `"${node.value}"` : String(node.value)}
          </span>
        );
      case "attribute":
        return (
          <span className="text-cyan-400 font-mono text-xs">{node.path}</span>
        );
      case "function":
        return null;
      default:
        return null;
    }
  };

  const inline = renderInline();
  if (inline) {
    return (
      <span className="inline-flex items-center gap-1 group">
        {inline}
        <button
          onClick={onClear}
          className="text-slate-600 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove"
        >
          ✕
        </button>
      </span>
    );
  }

  return null;
}

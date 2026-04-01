import { useState } from "react";
import { useExpression } from "../hooks/useExpression";
import type { ExpressionNode, ELFunction } from "../types/expression";
import TreeNode from "./TreeNode";
import FunctionCatalog from "./FunctionCatalog";

export default function TreeBuilder() {
  const { tree, setTree } = useExpression();
  const [catalogOpen, setCatalogOpen] = useState(false);

  const handleSelectFunction = (fn: ELFunction) => {
    const newNode: ExpressionNode = {
      type: "function",
      name: fn.name,
      arguments: [],
    };
    setTree(newNode);
    setCatalogOpen(false);
  };

  const handleSelectAttribute = (path: string) => {
    setTree({ type: "attribute", path });
    setCatalogOpen(false);
  };

  const handleSelectLiteral = (value: string | number | boolean | null) => {
    setTree({ type: "literal", value });
    setCatalogOpen(false);
  };

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
        <p className="text-slate-500 text-sm">Start building your expression</p>
        <button
          onClick={() => setCatalogOpen(true)}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-500 transition-colors"
        >
          + Add Function
        </button>
        {catalogOpen && (
          <FunctionCatalog
            onSelect={handleSelectFunction}
            onSelectAttribute={handleSelectAttribute}
            onSelectLiteral={handleSelectLiteral}
            onClose={() => setCatalogOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Expression Tree
        </h2>
        <button
          onClick={() => setTree(null)}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
      <TreeNode
        node={tree}
        depth={0}
        onChange={(newNode) => setTree(newNode)}
        onDelete={() => setTree(null)}
      />
    </div>
  );
}

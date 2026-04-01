import { useState, useMemo } from "react";
import { functionRegistry } from "../data/functionRegistry";
import type { ELFunction } from "../types/expression";

interface FunctionCatalogProps {
  onSelect: (fn: ELFunction) => void;
  onSelectAttribute: (path: string) => void;
  onSelectLiteral: (value: string | number | boolean | null) => void;
  onClose: () => void;
}

const categories = [
  "All",
  "String",
  "Array",
  "Conversion",
  "Directory",
  "Manager",
  "Time",
];

export default function FunctionCatalog({
  onSelect,
  onSelectAttribute,
  onSelectLiteral,
  onClose,
}: FunctionCatalogProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [tab, setTab] = useState<"functions" | "attributes" | "literal">("functions");
  const [literalValue, setLiteralValue] = useState("");
  const [literalType, setLiteralType] = useState<"string" | "number" | "boolean" | "null">(
    "string"
  );

  const filtered = useMemo(() => {
    let fns = functionRegistry;
    if (activeCategory !== "All") {
      fns = fns.filter((f) => f.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      fns = fns.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }
    return fns;
  }, [search, activeCategory]);

  const commonAttributes = [
    "user.login",
    "user.email",
    "user.firstName",
    "user.lastName",
    "user.displayName",
    "user.department",
    "user.title",
    "user.organization",
    "user.division",
    "user.userType",
    "user.employeeNumber",
    "user.costCenter",
    "user.managerId",
    "user.manager",
    "user.mobilePhone",
    "user.primaryPhone",
    "user.streetAddress",
    "user.city",
    "user.state",
    "user.zipCode",
    "user.countryCode",
  ];

  const [customAttr, setCustomAttr] = useState("");

  const handleLiteralSubmit = () => {
    switch (literalType) {
      case "string":
        onSelectLiteral(literalValue);
        break;
      case "number":
        onSelectLiteral(Number(literalValue));
        break;
      case "boolean":
        onSelectLiteral(literalValue === "true");
        break;
      case "null":
        onSelectLiteral(null);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-slate-800">
          <div className="flex gap-2 mb-3">
            {(["functions", "attributes", "literal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  tab === t
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t === "functions" ? "Functions" : t === "attributes" ? "Attributes" : "Literal"}
              </button>
            ))}
          </div>

          {tab === "functions" && (
            <>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search functions..."
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-600"
              />
              <div className="flex gap-1 mt-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-violet-600/30 text-violet-300"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {tab === "functions" &&
            filtered.map((fn) => (
              <button
                key={fn.name}
                onClick={() => onSelect(fn)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-mono text-violet-300 group-hover:text-violet-200">
                    {fn.name}
                  </span>
                  <span className="text-[10px] text-slate-600">{fn.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{fn.description}</p>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                  ({fn.parameters.map((p) => p.name).join(", ")}) → {fn.returnType}
                </p>
              </button>
            ))}

          {tab === "attributes" && (
            <div className="space-y-1">
              {commonAttributes.map((attr) => (
                <button
                  key={attr}
                  onClick={() => onSelectAttribute(attr)}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-sm font-mono text-violet-300"
                >
                  {attr}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-800">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={customAttr}
                    onChange={(e) => setCustomAttr(e.target.value)}
                    placeholder="user.customAttribute"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-600"
                  />
                  <button
                    onClick={() => {
                      if (customAttr.trim()) onSelectAttribute(customAttr.trim());
                    }}
                    className="px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "literal" && (
            <div className="p-2 space-y-3">
              <div className="flex gap-2">
                {(["string", "number", "boolean", "null"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLiteralType(t)}
                    className={`px-2 py-1 text-xs rounded ${
                      literalType === t
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {literalType === "null" ? (
                <button
                  onClick={() => onSelectLiteral(null)}
                  className="w-full px-3 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-500"
                >
                  Insert null
                </button>
              ) : literalType === "boolean" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectLiteral(true)}
                    className="flex-1 px-3 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-500"
                  >
                    true
                  </button>
                  <button
                    onClick={() => onSelectLiteral(false)}
                    className="flex-1 px-3 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-500"
                  >
                    false
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <input
                    type={literalType === "number" ? "number" : "text"}
                    value={literalValue}
                    onChange={(e) => setLiteralValue(e.target.value)}
                    placeholder={literalType === "number" ? "0" : "value"}
                    autoFocus
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-600"
                  />
                  <button
                    onClick={handleLiteralSubmit}
                    className="px-3 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-500"
                  >
                    Insert
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { useExpression } from "../hooks/useExpression";
import { parse } from "../engine/parser";
import { functionRegistry } from "../data/functionRegistry";
import { profileSchema } from "../data/defaultProfile";

export default function CodeEditor() {
  const { setTree, expressionString } = useExpression();
  const [code, setCode] = useState(expressionString);
  const [parseError, setParseError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(expressionString);
  }, [expressionString]);

  const allCompletions = [
    ...functionRegistry.map((f) => f.name),
    ...profileSchema.map((a) => `user.${a.key}`),
  ];

  const handleChange = useCallback(
    (value: string) => {
      setCode(value);

      if (!value.trim()) {
        setTree(null);
        setParseError(null);
        setShowSuggestions(false);
        return;
      }

      try {
        const parsed = parse(value);
        setTree(parsed);
        setParseError(null);
      } catch (e) {
        setParseError((e as Error).message);
      }

      const lastToken = value.split(/[\s(,]+/).pop() ?? "";
      if (lastToken.length >= 2) {
        const q = lastToken.toLowerCase();
        const matches = allCompletions.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
        setSelectedSuggestion(0);
      } else {
        setShowSuggestions(false);
      }
    },
    [setTree, allCompletions]
  );

  const applySuggestion = (suggestion: string) => {
    const lastTokenMatch = code.match(/[a-zA-Z0-9_.]+$/);
    if (lastTokenMatch) {
      const newCode = code.substring(0, code.length - lastTokenMatch[0].length) + suggestion;
      setCode(newCode);
      handleChange(newCode);
    }
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (suggestions[selectedSuggestion]) {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectedFn = (() => {
    const lastToken = code.split(/[\s(,]+/).pop() ?? "";
    return functionRegistry.find((f) => f.name === lastToken || code.includes(f.name + "("));
  })();

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Expression Editor
        </h2>
        {parseError && (
          <span className="text-xs text-red-400">{parseError}</span>
        )}
      </div>
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder='Start typing... e.g. String.toUpperCase(user.email) or user.firstName + " " + user.lastName'
          spellCheck={false}
          className="w-full h-full min-h-[200px] bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-emerald-400 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-600"
        />
        {showSuggestions && (
          <div className="absolute left-4 top-12 z-30 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => applySuggestion(s)}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono ${
                  i === selectedSuggestion
                    ? "bg-violet-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedFn && (
        <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-xs font-mono text-violet-400">{selectedFn.name}</div>
          <p className="text-xs text-slate-500 mt-1">{selectedFn.description}</p>
          <p className="text-[10px] text-slate-600 font-mono mt-1">
            ({selectedFn.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}) →{" "}
            {selectedFn.returnType}
          </p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">
            Example: {selectedFn.example}
          </p>
        </div>
      )}
    </div>
  );
}

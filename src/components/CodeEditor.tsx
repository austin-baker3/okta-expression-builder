import { useState, useRef, useEffect, useCallback } from "react";
import { useExpression } from "../hooks/useExpression";
import { parse } from "../engine/parser";
import { functionRegistry } from "../data/functionRegistry";
import { profileSchema } from "../data/defaultProfile";
import type { ParseError } from "../types/expression";

export default function CodeEditor() {
  const { setTree, expressionString, parseError, setParseError } = useExpression();
  const [code, setCode] = useState(expressionString);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

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
        const err = e as Error & { position?: number; length?: number; hint?: string };
        setParseError({
          message: err.message,
          position: err.position ?? 0,
          length: err.length ?? 1,
          hint: err.hint,
        } satisfies ParseError);
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
    [setTree, setParseError, allCompletions]
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

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const selectedFn = (() => {
    const lastToken = code.split(/[\s(,]+/).pop() ?? "";
    return functionRegistry.find((f) => f.name === lastToken || code.includes(f.name + "("));
  })();

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
          Expression Editor
        </h2>
        {parseError && (
          <span className="text-xs font-mono text-error px-2 py-0.5 bg-error-dim border border-error/20">
            {parseError.message}
          </span>
        )}
      </div>
      <div className="relative flex-1 bg-bg-surface border border-border">
        {/* Highlight layer */}
        <div
          ref={highlightRef}
          aria-hidden
          className="absolute inset-0 px-4 py-3 font-mono text-sm whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
        >
          {parseError && code && (
            <>
              <span className="invisible">
                {code.substring(0, parseError.position)}
              </span>
              <span
                data-testid="error-highlight"
                className="bg-error/20 border-b-2 border-error rounded-sm relative"
                style={{ pointerEvents: "auto" }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                {code.substring(parseError.position, parseError.position + parseError.length) || " "}
                {tooltipVisible && (
                  <span
                    data-testid="error-tooltip"
                    className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-bg-elevated border border-error/30 text-error text-xs font-mono whitespace-nowrap z-50 shadow-lg"
                  >
                    {parseError.message}
                    {parseError.hint && (
                      <span className="block text-text-muted mt-0.5">{parseError.hint}</span>
                    )}
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Textarea — transparent, on top */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder='Start typing... e.g. String.toUpperCase(user.email)'
          spellCheck={false}
          className="w-full h-full min-h-[200px] bg-transparent px-4 py-3 font-mono text-sm text-code-green placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-colors relative z-10"
          style={{ caretColor: "var(--color-code-green)" }}
        />
        {showSuggestions && (
          <div className="absolute left-4 top-12 z-30 bg-bg-elevated border border-border shadow-xl max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => applySuggestion(s)}
                className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${
                  i === selectedSuggestion
                    ? "bg-accent text-bg-deep"
                    : "text-text-secondary hover:bg-bg-hover"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedFn && (
        <div className="mt-4 p-4 bg-bg-surface border border-border">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-accent">{selectedFn.name}</span>
            <span className="text-[10px] font-mono text-text-muted">
              ({selectedFn.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}) &rarr;{" "}
              {selectedFn.returnType}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1.5">{selectedFn.description}</p>
          <p className="text-[10px] text-text-muted font-mono mt-1.5 border-t border-border-subtle pt-1.5">
            {selectedFn.example}
          </p>
        </div>
      )}
    </div>
  );
}

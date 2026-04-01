import { useState } from "react";
import { useExpression } from "../hooks/useExpression";

export default function OutputBar() {
  const { expressionString, evalResult, validationErrors } = useExpression();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!expressionString) return;
    await navigator.clipboard.writeText(expressionString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasErrors = validationErrors.length > 0;
  const isEmpty = !expressionString;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950 px-4 py-3 z-50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isEmpty ? (
            <span className="text-slate-600 text-sm italic">
              Build an expression to see output...
            </span>
          ) : (
            <>
              <code className="text-emerald-400 text-sm font-mono truncate">
                {expressionString}
              </code>
              {evalResult && (
                <>
                  <span className="text-slate-700">|</span>
                  {evalResult.ok ? (
                    <span className="text-amber-400 text-sm font-mono shrink-0">
                      → {String(evalResult.value)}
                    </span>
                  ) : (
                    <span className="text-red-400 text-sm font-mono shrink-0">
                      {evalResult.error}
                    </span>
                  )}
                </>
              )}
              {hasErrors ? (
                <span className="text-red-400 text-xs shrink-0" title={validationErrors[0].message}>
                  ✗ {validationErrors[0].message}
                </span>
              ) : !isEmpty ? (
                <span className="text-emerald-500 text-xs shrink-0">✓ Valid</span>
              ) : null}
            </>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={isEmpty}
          className="shrink-0 px-4 py-1.5 text-sm font-medium rounded-md bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

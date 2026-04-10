import { useState } from "react";
import { useExpression } from "../hooks/useExpression";

export default function OutputBar() {
  const { expressionString, evalResult, validationErrors, parseError } = useExpression();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!expressionString) return;
    await navigator.clipboard.writeText(expressionString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasErrors = validationErrors.length > 0 || parseError !== null;
  const isEmpty = !expressionString && !parseError;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg-deep px-5 py-3 z-50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isEmpty ? (
            <span className="text-text-muted text-sm font-mono italic">
              Build an expression to see output...
            </span>
          ) : (
            <>
              {expressionString && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-text-muted text-[10px] font-mono uppercase tracking-widest shrink-0">out</span>
                  <code className="text-code-green text-sm font-mono truncate">
                    {expressionString}
                  </code>
                </div>
              )}
              {evalResult && !parseError && (
                <>
                  <span className="text-border shrink-0">/</span>
                  {evalResult.ok ? (
                    <span className="text-value-amber text-sm font-mono shrink-0">
                      {String(evalResult.value)}
                    </span>
                  ) : (
                    <span className="text-error text-sm font-mono shrink-0">
                      {evalResult.error}
                    </span>
                  )}
                </>
              )}
              {parseError ? (
                <span
                  className="text-error text-xs font-mono shrink-0 px-2 py-0.5 bg-error-dim border border-error/20"
                  title={parseError.hint ?? parseError.message}
                >
                  {parseError.message}
                </span>
              ) : validationErrors.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {validationErrors.map((err, i) => (
                    <span
                      key={i}
                      className="text-error text-xs font-mono shrink-0 px-2 py-0.5 bg-error-dim border border-error/20"
                      title={err.message}
                    >
                      {err.message}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-code-green text-xs font-mono shrink-0 px-2 py-0.5 bg-code-green/10 border border-code-green/20">
                  valid
                </span>
              )}
            </>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={isEmpty}
          className="shrink-0 px-5 py-1.5 text-xs font-mono uppercase tracking-wider bg-accent text-bg-deep font-medium hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

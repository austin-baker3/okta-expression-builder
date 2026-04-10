import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { ExpressionContext, useExpressionState, useExpression } from "../useExpression";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  const state = useExpressionState();
  return (
    <ExpressionContext.Provider value={state}>
      {children}
    </ExpressionContext.Provider>
  );
}

describe("useExpression", () => {
  it("exposes parseError as null initially", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    expect(result.current.parseError).toBeNull();
  });

  it("exposes setParseError function", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    expect(typeof result.current.setParseError).toBe("function");
  });

  it("exposes validationErrors as empty array initially", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    expect(result.current.validationErrors).toEqual([]);
  });
});

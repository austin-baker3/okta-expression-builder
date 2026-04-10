import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ExpressionContext, useExpressionState, useExpression } from "../useExpression";
import { parse } from "../../engine/parser";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  const state = useExpressionState();
  return (
    <ExpressionContext.Provider value={state}>
      {children}
    </ExpressionContext.Provider>
  );
}

describe("useExpression app profile evaluation", () => {
  it("evaluates app.* attributes after loading preset", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    act(() => {
      result.current.loadPreset("workday");
    });
    act(() => {
      result.current.setTree(parse("app.department"));
    });
    expect(result.current.evalResult).toEqual({ ok: true, value: "Engineering" });
  });

  it("evaluates user + app mixed expression", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    act(() => {
      result.current.loadPreset("workday");
    });
    act(() => {
      result.current.setTree(parse('user.firstName + " @ " + app.department'));
    });
    expect(result.current.evalResult).toEqual({ ok: true, value: "Jane @ Engineering" });
  });
});

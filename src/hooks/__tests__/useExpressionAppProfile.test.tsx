import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
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

describe("useExpression app profile", () => {
  it("exposes appProfile as empty object initially", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    expect(result.current.appProfile).toEqual({});
  });

  it("exposes activePreset as null initially", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    expect(result.current.activePreset).toBeNull();
  });

  it("loadPreset loads preset attributes with source 'preset'", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    act(() => {
      result.current.loadPreset("workday");
    });
    expect(result.current.activePreset).toBe("workday");
    expect(result.current.appProfile.workerID).toEqual({
      value: "WD-100042",
      source: "preset",
    });
  });

  it("swapping presets replaces preset attributes but keeps custom", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    act(() => {
      result.current.loadPreset("workday");
    });
    act(() => {
      result.current.addCustomAppField("myCustom", "customVal");
    });
    act(() => {
      result.current.loadPreset("bamboohr");
    });
    // Workday-specific attr gone
    expect(result.current.appProfile.workerID).toBeUndefined();
    // BambooHR attr present
    expect(result.current.appProfile.employeeId).toBeDefined();
    expect(result.current.appProfile.employeeId.source).toBe("preset");
    // Custom preserved
    expect(result.current.appProfile.myCustom).toEqual({
      value: "customVal",
      source: "custom",
    });
  });

  it("updateAppProfileField updates value", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    act(() => {
      result.current.loadPreset("workday");
    });
    act(() => {
      result.current.updateAppProfileField("department", "Sales");
    });
    expect(result.current.appProfile.department.value).toBe("Sales");
  });

  it("addCustomAppField adds with source 'custom'", () => {
    const { result } = renderHook(() => useExpression(), { wrapper: Wrapper });
    act(() => {
      result.current.addCustomAppField("newField", "newVal");
    });
    expect(result.current.appProfile.newField).toEqual({
      value: "newVal",
      source: "custom",
    });
  });
});

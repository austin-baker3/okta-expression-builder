import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OutputBar from "../OutputBar";
import { ExpressionContext } from "../../hooks/useExpression";
import type { ExpressionState } from "../../hooks/useExpression";

function renderWithState(overrides: Partial<ExpressionState>) {
  const defaultState: ExpressionState = {
    tree: null,
    setTree: () => {},
    profile: {},
    setProfile: () => {},
    updateProfileField: () => {},
    addCustomField: () => {},
    expressionString: "",
    evalResult: null,
    validationErrors: [],
    parseError: null,
    setParseError: () => {},
    appProfile: {},
    activePreset: null,
    loadPreset: () => {},
    updateAppProfileField: () => {},
    addCustomAppField: () => {},
    mode: "advanced",
    setMode: () => {},
    profileOpen: false,
    setProfileOpen: () => {},
  };

  return render(
    <ExpressionContext.Provider value={{ ...defaultState, ...overrides }}>
      <OutputBar />
    </ExpressionContext.Provider>
  );
}

describe("OutputBar", () => {
  it("shows all validation errors, not just the first", () => {
    renderWithState({
      expressionString: "test()",
      validationErrors: [
        { message: "Unknown function: test", path: [] },
        { message: "Attribute path is empty", path: [0] },
      ],
    });

    expect(screen.getByText("Unknown function: test")).toBeInTheDocument();
    expect(screen.getByText("Attribute path is empty")).toBeInTheDocument();
  });

  it("shows valid badge when no errors", () => {
    renderWithState({
      expressionString: "user.email",
      validationErrors: [],
    });

    expect(screen.getByText("valid")).toBeInTheDocument();
  });

  it("shows parse error from context", () => {
    renderWithState({
      expressionString: "",
      parseError: {
        message: "Unexpected character at position 5",
        position: 5,
        length: 1,
      },
    });

    expect(screen.getByText(/Unexpected character/)).toBeInTheDocument();
  });
});

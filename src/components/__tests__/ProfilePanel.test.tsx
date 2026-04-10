import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProfilePanel from "../ProfilePanel";
import { ExpressionContext } from "../../hooks/useExpression";
import type { ExpressionState } from "../../hooks/useExpression";
import type { AppProfileData } from "../../types/expression";

function renderWithState(overrides: Partial<ExpressionState> = {}) {
  const defaultState: ExpressionState = {
    tree: null,
    setTree: () => {},
    profile: { firstName: "Jane", email: "jane@acme.com" },
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
    profileOpen: true,
    setProfileOpen: () => {},
  };

  return render(
    <ExpressionContext.Provider value={{ ...defaultState, ...overrides }}>
      <ProfilePanel />
    </ExpressionContext.Provider>
  );
}

describe("ProfilePanel", () => {
  it("renders User and App tabs", () => {
    renderWithState();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("App")).toBeInTheDocument();
  });

  it("shows user profile fields by default", () => {
    renderWithState();
    expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
  });

  it("switches to App tab and shows HRIS preset buttons", () => {
    renderWithState();
    fireEvent.click(screen.getByText("App"));
    expect(screen.getByText("Workday")).toBeInTheDocument();
    expect(screen.getByText("BambooHR")).toBeInTheDocument();
    expect(screen.getByText("SAP SuccessFactors")).toBeInTheDocument();
    expect(screen.getByText("UKG Pro")).toBeInTheDocument();
    expect(screen.getByText("Aquera (ADP)")).toBeInTheDocument();
  });

  it("shows app profile fields when preset is loaded", () => {
    const appProfile: AppProfileData = {
      department: { value: "Engineering", source: "preset" },
    };
    renderWithState({ appProfile, activePreset: "workday" });
    fireEvent.click(screen.getByText("App"));
    expect(screen.getByDisplayValue("Engineering")).toBeInTheDocument();
  });

  it("highlights active preset button", () => {
    renderWithState({ activePreset: "workday" });
    fireEvent.click(screen.getByText("App"));
    const workdayBtn = screen.getByText("Workday");
    expect(workdayBtn.closest("button")?.className).toContain("border-accent");
  });

  it("does not render when profileOpen is false", () => {
    renderWithState({ profileOpen: false });
    expect(screen.queryByText("User")).not.toBeInTheDocument();
  });
});

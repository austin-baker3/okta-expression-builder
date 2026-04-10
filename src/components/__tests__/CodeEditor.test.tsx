import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CodeEditor from "../CodeEditor";
import { ExpressionContext, useExpressionState } from "../../hooks/useExpression";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  const state = useExpressionState();
  return (
    <ExpressionContext.Provider value={state}>
      {children}
    </ExpressionContext.Provider>
  );
}

describe("CodeEditor", () => {
  it("renders textarea", () => {
    render(<CodeEditor />, { wrapper: Wrapper });
    expect(screen.getByPlaceholderText(/Start typing/)).toBeInTheDocument();
  });

  it("shows error highlight overlay for parse errors", async () => {
    const { container } = render(<CodeEditor />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText(/Start typing/);
    await userEvent.type(textarea, "user.email @@");

    const highlight = container.querySelector("[data-testid='error-highlight']");
    expect(highlight).toBeInTheDocument();
  });

  it("shows error message in header for parse errors", async () => {
    render(<CodeEditor />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText(/Start typing/);
    await userEvent.type(textarea, "user.email @@");

    const errorEl = screen.getByText(/Unexpected/);
    expect(errorEl).toBeInTheDocument();
  });

  it("shows tooltip on hover over error highlight", async () => {
    const { container } = render(<CodeEditor />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText(/Start typing/);
    await userEvent.type(textarea, "user.email @@");

    const highlight = container.querySelector("[data-testid='error-highlight']");
    if (highlight) {
      fireEvent.mouseEnter(highlight);
      const tooltip = container.querySelector("[data-testid='error-tooltip']");
      expect(tooltip).toBeInTheDocument();
    }
  });
});

import { ExpressionContext, useExpressionState } from "../hooks/useExpression";
import Header from "./Header";
import OutputBar from "./OutputBar";

export default function App() {
  const state = useExpressionState();

  return (
    <ExpressionContext.Provider value={state}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 p-4 pb-16">
          <div className="text-slate-500 text-sm text-center mt-32">
            {state.mode === "easy"
              ? "Tree builder coming soon..."
              : "Code editor coming soon..."}
          </div>
        </main>
        <OutputBar />
      </div>
    </ExpressionContext.Provider>
  );
}

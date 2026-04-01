import { useExpression } from "../hooks/useExpression";

export default function Header() {
  const { mode, setMode, profileOpen, setProfileOpen } = useExpression();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
      <h1 className="text-lg font-bold text-violet-400 tracking-tight">
        Okta Expression Builder
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
        >
          {profileOpen ? "Hide" : "Show"} Profile
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${mode === "easy" ? "text-violet-400" : "text-slate-500"}`}
          >
            Easy
          </span>
          <button
            onClick={() => setMode(mode === "easy" ? "advanced" : "easy")}
            className="relative w-10 h-5 rounded-full bg-slate-700 transition-colors"
            aria-label={`Switch to ${mode === "easy" ? "advanced" : "easy"} mode`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-violet-500 transition-transform ${
                mode === "advanced" ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span
            className={`text-xs font-medium ${mode === "advanced" ? "text-violet-400" : "text-slate-500"}`}
          >
            Advanced
          </span>
        </div>
      </div>
    </header>
  );
}

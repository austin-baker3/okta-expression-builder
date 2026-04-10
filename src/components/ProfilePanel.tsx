import { useState } from "react";
import { useExpression } from "../hooks/useExpression";
import { profileSchema } from "../data/defaultProfile";
import { hrisPresets } from "../data/hrisPresets";

export default function ProfilePanel() {
  const {
    profile,
    updateProfileField,
    addCustomField,
    profileOpen,
    appProfile,
    activePreset,
    loadPreset,
    updateAppProfileField,
    addCustomAppField,
  } = useExpression();
  const [tab, setTab] = useState<"user" | "app">("user");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newAppKey, setNewAppKey] = useState("");
  const [newAppValue, setNewAppValue] = useState("");

  if (!profileOpen) return null;

  const customUserKeys = Object.keys(profile).filter(
    (k) => !profileSchema.some((s) => s.key === k)
  );

  const presetKeys = Object.entries(appProfile)
    .filter(([, entry]) => entry.source === "preset")
    .map(([key]) => key);

  const customAppKeys = Object.entries(appProfile)
    .filter(([, entry]) => entry.source === "custom")
    .map(([key]) => key);

  const handleAddCustom = () => {
    const key = newKey.trim();
    if (!key) return;
    addCustomField(key, newValue);
    setNewKey("");
    setNewValue("");
  };

  const handleAddCustomApp = () => {
    const key = newAppKey.trim();
    if (!key) return;
    addCustomAppField(key, newAppValue);
    setNewAppKey("");
    setNewAppValue("");
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-72 border-l border-border bg-bg-deep overflow-y-auto pb-16 z-30 shadow-2xl">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("user")}
          className={`flex-1 px-4 py-3 text-[10px] font-mono uppercase tracking-widest transition-colors ${
            tab === "user"
              ? "text-accent border-b-2 border-accent"
              : "text-text-muted hover:text-text"
          }`}
        >
          User
        </button>
        <button
          onClick={() => setTab("app")}
          className={`flex-1 px-4 py-3 text-[10px] font-mono uppercase tracking-widest transition-colors ${
            tab === "app"
              ? "text-accent border-b-2 border-accent"
              : "text-text-muted hover:text-text"
          }`}
        >
          App
        </button>
      </div>

      {tab === "user" && (
        <div className="p-4 space-y-3">
          {profileSchema.map((attr) => (
            <div key={attr.key}>
              <label className="block text-[10px] font-mono text-text-muted mb-1 tracking-wide">
                {attr.key}
              </label>
              <input
                type="text"
                value={profile[attr.key] === null ? "" : String(profile[attr.key] ?? "")}
                onChange={(e) => updateProfileField(attr.key, e.target.value)}
                placeholder="null"
                className="w-full bg-bg-surface border border-border-subtle px-2.5 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}

          {customUserKeys.map((key) => (
            <div key={key}>
              <label className="block text-[10px] font-mono text-text-muted mb-1">
                {key} <span className="text-accent">(custom)</span>
              </label>
              <input
                type="text"
                value={profile[key] === null ? "" : String(profile[key] ?? "")}
                onChange={(e) => updateProfileField(key, e.target.value)}
                placeholder="null"
                className="w-full bg-bg-surface border border-border-subtle px-2.5 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
              Add custom attribute
            </p>
            <div className="flex gap-1">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="key"
                className="flex-1 bg-bg-surface border border-border-subtle px-2 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="value"
                className="flex-1 bg-bg-surface border border-border-subtle px-2 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleAddCustom}
                className="px-2.5 py-1.5 text-xs font-mono bg-accent text-bg-deep hover:bg-accent-hover transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "app" && (
        <div className="p-4 space-y-3">
          {/* HRIS preset buttons */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
              Load HRIS preset
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {hrisPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className={`px-2.5 py-2 text-xs font-mono text-left transition-all duration-200 border ${
                    activePreset === preset.id
                      ? "border-accent bg-accent-dim text-accent"
                      : "border-border-subtle text-text-secondary hover:border-accent hover:text-text"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preset attribute fields */}
          {presetKeys.length > 0 && (
            <div className="pt-3 border-t border-border space-y-3">
              {presetKeys.map((key) => (
                <div key={key}>
                  <label className="block text-[10px] font-mono text-text-muted mb-1 tracking-wide">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={appProfile[key].value === null ? "" : String(appProfile[key].value ?? "")}
                    onChange={(e) => updateAppProfileField(key, e.target.value)}
                    placeholder="null"
                    className="w-full bg-bg-surface border border-border-subtle px-2.5 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Custom app fields */}
          {customAppKeys.map((key) => (
            <div key={key}>
              <label className="block text-[10px] font-mono text-text-muted mb-1">
                {key} <span className="text-accent">(custom)</span>
              </label>
              <input
                type="text"
                value={appProfile[key].value === null ? "" : String(appProfile[key].value ?? "")}
                onChange={(e) => updateAppProfileField(key, e.target.value)}
                placeholder="null"
                className="w-full bg-bg-surface border border-border-subtle px-2.5 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}

          {/* Add custom app attribute */}
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
              Add custom attribute
            </p>
            <div className="flex gap-1">
              <input
                type="text"
                value={newAppKey}
                onChange={(e) => setNewAppKey(e.target.value)}
                placeholder="key"
                className="flex-1 bg-bg-surface border border-border-subtle px-2 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                value={newAppValue}
                onChange={(e) => setNewAppValue(e.target.value)}
                placeholder="value"
                className="flex-1 bg-bg-surface border border-border-subtle px-2 py-1.5 text-xs font-mono text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleAddCustomApp}
                className="px-2.5 py-1.5 text-xs font-mono bg-accent text-bg-deep hover:bg-accent-hover transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

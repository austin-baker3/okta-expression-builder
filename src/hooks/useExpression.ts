import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ExpressionNode, ProfileData, ValidationError, ParseError } from "../types/expression";
import { serialize } from "../engine/serializer";
import { evaluate, type EvalResult } from "../engine/evaluator";
import { validate } from "../engine/validator";
import { defaultProfileData } from "../data/defaultProfile";

export interface ExpressionState {
  tree: ExpressionNode | null;
  setTree: (tree: ExpressionNode | null) => void;
  profile: ProfileData;
  setProfile: (profile: ProfileData) => void;
  updateProfileField: (key: string, value: string | null) => void;
  addCustomField: (key: string, value: string) => void;
  expressionString: string;
  evalResult: EvalResult | null;
  validationErrors: ValidationError[];
  parseError: ParseError | null;
  setParseError: (error: ParseError | null) => void;
  mode: "easy" | "advanced";
  setMode: (mode: "easy" | "advanced") => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
}

export const ExpressionContext = createContext<ExpressionState | null>(null);

export function useExpressionState(): ExpressionState {
  const [tree, setTree] = useState<ExpressionNode | null>(null);
  const [profile, setProfile] = useState<ProfileData>({ ...defaultProfileData });
  const [mode, setMode] = useState<"easy" | "advanced">("easy");
  const [profileOpen, setProfileOpen] = useState(false);
  const [parseError, setParseError] = useState<ParseError | null>(null);

  const updateProfileField = useCallback((key: string, value: string | null) => {
    setProfile((prev) => ({ ...prev, [key]: value === "" ? null : value }));
  }, []);

  const addCustomField = useCallback((key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }, []);

  const expressionString = useMemo(() => {
    if (!tree) return "";
    return serialize(tree);
  }, [tree]);

  const evalResult = useMemo(() => {
    if (!tree) return null;
    return evaluate(tree, profile);
  }, [tree, profile]);

  const validationErrors = useMemo(() => {
    if (!tree) return [];
    return validate(tree);
  }, [tree]);

  return {
    tree,
    setTree,
    profile,
    setProfile,
    updateProfileField,
    addCustomField,
    expressionString,
    evalResult,
    validationErrors,
    parseError,
    setParseError,
    mode,
    setMode,
    profileOpen,
    setProfileOpen,
  };
}

export function useExpression(): ExpressionState {
  const ctx = useContext(ExpressionContext);
  if (!ctx) throw new Error("useExpression must be used within ExpressionContext");
  return ctx;
}

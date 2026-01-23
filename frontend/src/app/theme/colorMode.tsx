import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Mode = "light" | "dark";

type ColorModeCtx = {
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
};

const Ctx = createContext<ColorModeCtx | null>(null);

function readInitial(): Mode {
  const raw = localStorage.getItem("ui:colorMode");
  if (raw === "light" || raw === "dark") return raw;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  return prefersDark ? "dark" : "light";
}

export function ColorModeProvider(p: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => readInitial());

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem("ui:colorMode", m);
  };

  const toggle = () => setMode(mode === "dark" ? "light" : "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  const value = useMemo<ColorModeCtx>(() => ({ mode, toggle, setMode }), [mode]);

  return <Ctx.Provider value={value}>{p.children}</Ctx.Provider>;
}

export function useColorMode() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useColorMode must be used within ColorModeProvider");
  return v;
}

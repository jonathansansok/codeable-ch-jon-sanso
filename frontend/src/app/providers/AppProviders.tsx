import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildAppTheme } from "../theme/theme";
import { ColorModeContext } from "../theme/useColorMode";

function readStoredMode(): "light" | "dark" | null {
  try {
    const raw = localStorage.getItem("ui:colorMode");
    if (raw === "light" || raw === "dark") return raw;
    return null;
  } catch {
    return null;
  }
}

function detectPreferredMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  return mq?.matches ? "dark" : "light";
}

export function AppProviders(p: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<"light" | "dark">(() => {
    return readStoredMode() ?? detectPreferredMode();
  });

  const setMode = useCallback((m: "light" | "dark") => {
    setModeState(m);
    try {
      localStorage.setItem("ui:colorMode", m);
    } catch {
      return;
    }
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("ui:colorMode", next);
      } catch {
        return next;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const theme = useMemo(() => buildAppTheme(mode), [mode]);

  const ctx = useMemo(() => ({ mode, toggle, setMode }), [mode, toggle, setMode]);

  return (
    <ColorModeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {p.children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

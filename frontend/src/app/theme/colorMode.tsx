import { useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { buildAppTheme } from "./theme";
import { ColorModeContext, type ColorModeCtx } from "./colorMode.context";

export function ColorModeProvider(p: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const raw = localStorage.getItem("ui:mode");
    return raw === "dark" ? "dark" : "light";
  });

  const value = useMemo<ColorModeCtx>(
    () => ({
      mode,
      toggle: () => {
        setMode((prev) => {
          const next = prev === "dark" ? "light" : "dark";
          localStorage.setItem("ui:mode", next);
          return next;
        });
      },
    }),
    [mode],
  );

  const theme = useMemo(() => buildAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{p.children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

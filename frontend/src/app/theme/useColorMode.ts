import { createContext, useContext } from "react";

export type ColorModeState = {
  mode: "light" | "dark";
  toggle: () => void;
  setMode: (m: "light" | "dark") => void;
};

export const ColorModeContext = createContext<ColorModeState | null>(null);

export function useColorMode() {
  const v = useContext(ColorModeContext);
  if (!v) throw new Error("useColorMode must be used within AppProviders");
  return v;
}

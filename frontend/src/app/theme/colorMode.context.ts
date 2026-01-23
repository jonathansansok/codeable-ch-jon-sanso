import { createContext } from "react";

export type ColorModeCtx = {
  mode: "light" | "dark";
  toggle: () => void;
};

export const ColorModeContext = createContext<ColorModeCtx | null>(null);

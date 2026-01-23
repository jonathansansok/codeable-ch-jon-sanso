import { useContext } from "react";
import { ColorModeContext } from "./colorMode.context";

export function useColorMode() {
  const v = useContext(ColorModeContext);
  if (!v) throw new Error("useColorMode must be used within ColorModeProvider");
  return v;
}

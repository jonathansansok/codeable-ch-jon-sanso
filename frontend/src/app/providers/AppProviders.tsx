import { CssBaseline } from "@mui/material";
import { ColorModeProvider } from "../theme/colorMode";

export function AppProviders(p: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <CssBaseline />
      {p.children}
    </ColorModeProvider>
  );
}

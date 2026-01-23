import { createTheme } from "@mui/material/styles";

export function buildAppTheme(mode: "light" | "dark") {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
    },
  });
}

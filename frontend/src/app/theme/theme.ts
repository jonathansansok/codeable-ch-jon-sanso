import { createTheme } from "@mui/material/styles";

export function buildTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? "#2f81f7" : "#0969da" },
      secondary: { main: isDark ? "#a371f7" : "#8250df" },
      success: { main: isDark ? "#3fb950" : "#1a7f37" },
      error: { main: isDark ? "#f85149" : "#cf222e" },
      warning: { main: isDark ? "#d29922" : "#9a6700" },
      info: { main: isDark ? "#58a6ff" : "#0969da" },
      background: {
        default: isDark ? "#0d1117" : "#f6f8fa",
        paper: isDark ? "#161b22" : "#ffffff"
      },
      text: {
        primary: isDark ? "#e6edf3" : "#24292f",
        secondary: isDark ? "#8b949e" : "#57606a"
      },
      divider: isDark ? "#30363d" : "#d0d7de"
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Geist", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      h6: { fontWeight: 850 },
      subtitle2: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 800 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: "transparent" }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12
          }
        }
      }
    }
  });
}

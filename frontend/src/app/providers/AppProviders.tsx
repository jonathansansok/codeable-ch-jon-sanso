import { CssBaseline } from "@mui/material";
import { ThemeProvider, alpha, createTheme, responsiveFontSizes } from "@mui/material/styles";
import { useMemo } from "react";
import { ColorModeProvider, useColorMode } from "../theme/colorMode";

function buildTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#0969DA",
        light: "#54AEFF",
        dark: "#0550AE",
        contrastText: "#FFFFFF"
      },
      success: {
        main: "#1A7F37",
        contrastText: "#FFFFFF"
      },
      error: {
        main: "#CF222E",
        contrastText: "#FFFFFF"
      },
      warning: {
        main: "#9A6700",
        contrastText: "#FFFFFF"
      },
      background: {
        default: isDark ? "#0D1117" : "#F6F8FA",
        paper: isDark ? "#161B22" : "#FFFFFF"
      },
      text: {
        primary: isDark ? "#E6EDF3" : "#1F2328",
        secondary: isDark ? "#9BA3AF" : "#57606A"
      },
      divider: isDark ? "#30363D" : "#D0D7DE",
      action: {
        hover: isDark ? alpha("#FFFFFF", 0.06) : alpha("#000000", 0.04),
        selected: isDark ? alpha("#FFFFFF", 0.09) : alpha("#000000", 0.06)
      }
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Geist Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      h6: { fontWeight: 800 },
      subtitle2: { fontWeight: 700 },
      button: { fontWeight: 800, letterSpacing: 0 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? "radial-gradient(900px 420px at 10% -10%, rgba(9,105,218,0.18), transparent 55%), radial-gradient(700px 360px at 95% 0%, rgba(26,127,55,0.12), transparent 55%)"
              : "radial-gradient(900px 420px at 10% -10%, rgba(9,105,218,0.12), transparent 55%), radial-gradient(700px 360px at 95% 0%, rgba(26,127,55,0.10), transparent 55%)"
          }
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
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 12
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${isDark ? "#30363D" : "#D0D7DE"}`
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10
          }
        }
      }
    }
  });

  return responsiveFontSizes(theme);
}

function MuiThemeBridge(p: { children: React.ReactNode }) {
  const cm = useColorMode();

  const theme = useMemo(() => buildTheme(cm.mode), [cm.mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {p.children}
    </ThemeProvider>
  );
}

export function AppProviders(p: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <MuiThemeBridge>{p.children}</MuiThemeBridge>
    </ColorModeProvider>
  );
}

import { alpha, createTheme } from "@mui/material/styles";

const GH = {
  light: {
    bg: "#f6f8fa",
    paper: "#ffffff",
    text: "#24292f",
    text2: "#57606a",
    border: "#d0d7de",
    primary: "#0969da",
    primary2: "#0550ae",
    success: "#1a7f37",
    error: "#d1242f",
    warning: "#9a6700"
  },
  dark: {
    bg: "#0d1117",
    paper: "#161b22",
    text: "#c9d1d9",
    text2: "#8b949e",
    border: "#30363d",
    primary: "#2f81f7",
    primary2: "#1f6feb",
    success: "#2ea043",
    error: "#f85149",
    warning: "#d29922"
  }
} as const;

export function buildAppTheme(mode: "light" | "dark") {
  const C = mode === "dark" ? GH.dark : GH.light;

  return createTheme({
    palette: {
      mode,
      primary: { main: C.primary, dark: C.primary2 },
      success: { main: C.success },
      error: { main: C.error },
      warning: { main: C.warning },
      background: { default: C.bg, paper: C.paper },
      text: { primary: C.text, secondary: C.text2 },
      divider: C.border,
      action: {
        hover: mode === "dark" ? "rgba(47,129,247,0.10)" : "rgba(9,105,218,0.08)",
        selected: mode === "dark" ? "rgba(47,129,247,0.16)" : "rgba(9,105,218,0.12)"
      }
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      h6: { fontWeight: 900, letterSpacing: -0.2 },
      subtitle2: { fontWeight: 800 },
      button: { textTransform: "none", fontWeight: 800 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage:
              mode === "dark"
                ? "radial-gradient(1200px 700px at 15% 10%, rgba(47,129,247,0.18), transparent 55%), radial-gradient(900px 500px at 85% 30%, rgba(46,160,67,0.12), transparent 55%)"
                : "radial-gradient(1200px 700px at 15% 10%, rgba(9,105,218,0.12), transparent 55%), radial-gradient(900px 500px at 85% 30%, rgba(26,127,55,0.10), transparent 55%)",
            backgroundAttachment: "fixed"
          },
          "::selection": {
            background: alpha(C.primary, 0.25)
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.default, 0.72)
                : alpha(theme.palette.background.default, 0.72),
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${theme.palette.divider}`
          })
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderColor: C.border,
            backgroundImage:
              mode === "dark"
                ? "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.00))"
                : "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.00))"
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none"
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 900,
            letterSpacing: 0.2
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12
          },
          contained: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10,
            fontWeight: 700
          }
        }
      }
    }
  });
}

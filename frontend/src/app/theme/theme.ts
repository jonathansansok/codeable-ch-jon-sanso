import { alpha, createTheme } from "@mui/material/styles";

export function buildAppTheme(mode: "light" | "dark") {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif'
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.default, 0.6)
                : alpha(theme.palette.background.paper, 0.75),
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${theme.palette.divider}`
          })
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
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
      }
    }
  });
}

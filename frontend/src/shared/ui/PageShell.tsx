import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useColorMode } from "../../app/theme/useColorMode";
import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";

type NavItem = {
  key: string;
  label: string;
};

function ThemeIcon(p: { mode: "light" | "dark" }) {
  return (
    <span style={{ fontSize: 18, lineHeight: 1 }}>
      {p.mode === "dark" ? "☾" : "☼"}
    </span>
  );
}

export function PageShell(p: {
  title: string;
  navItems: NavItem[];
  activeNavKey: string;
  onNavChange: (key: string) => void;
  children: React.ReactNode;
}) {
  const cm = useColorMode();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

  const drawerWidth = 280;
  const railWidth = 16;

  const [mobileOpen, setMobileOpen] = useState(false);

  const [desktopOpen, setDesktopOpen] = useState<boolean>(() => {
    const raw = localStorage.getItem("ui:navOpen");
    return raw === "1";
  });

  const activeLabel = useMemo(() => {
    return p.navItems.find((x) => x.key === p.activeNavKey)?.label ?? "";
  }, [p.navItems, p.activeNavKey]);

  const isDesktop = mdUp;

  const toggleDesktop = () => {
    setDesktopOpen((prev) => {
      const next = !prev;
      localStorage.setItem("ui:navOpen", next ? "1" : "0");
      return next;
    });
  };

  const drawerContent = (
    <Box className="h-full flex flex-col">
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" noWrap>
          Planta / Configuración
        </Typography>
      </Box>

      <Divider />

      <List disablePadding sx={{ py: 1 }}>
        {p.navItems.map((x) => {
          const selected = x.key === p.activeNavKey;
          return (
            <ListItemButton
              key={x.key}
              selected={selected}
              onClick={() => {
                p.onNavChange(x.key);
                setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                px: 2,
                borderLeft: selected ? "3px solid" : "3px solid transparent",
                borderLeftColor: selected ? "primary.main" : "transparent",
              }}
            >
              <ListItemText
                primary={x.label}
                primaryTypographyProps={{
                  fontWeight: selected ? 800 : 600,
                  noWrap: true,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box className="flex-1" />

      <Box
        sx={{
          position: "sticky",
          bottom: 12,
          px: 1.25,
          pb: 1,
          display: "flex",
          justifyContent: "flex-end",
          pointerEvents: "none",
        }}
      >
        <IconButton
          onClick={toggleDesktop}
          aria-label="Cerrar sidebar"
          sx={{
            pointerEvents: "auto",
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <FiChevronLeft size={20} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box className="min-h-screen">
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar className="flex items-center justify-between">
          <Box className="flex items-center gap-2 min-w-0">
            {!isDesktop && (
              <IconButton
                aria-label="Abrir menú"
                onClick={() => setMobileOpen(true)}
                sx={{ width: 40, height: 40 }}
              >
                <FiMenu size={20} />
              </IconButton>
            )}

            <Box className="min-w-0">
              <Typography variant="h6" fontWeight={900} noWrap>
                {p.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {activeLabel}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={cm.toggle} aria-label="toggle theme">
            <ThemeIcon mode={cm.mode} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {isDesktop ? (
          <>
            <Drawer
              variant="persistent"
              open={desktopOpen}
              sx={{
                width: desktopOpen ? drawerWidth : 0,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                  position: "relative",
                  borderRight: "1px solid",
                  borderRightColor: "divider",
                  overflowX: "hidden",
                },
              }}
            >
              {drawerContent}
            </Drawer>

            {!desktopOpen && (
              <Box
                sx={{
                  width: railWidth,
                  flexShrink: 0,
                  position: "relative",
                  borderRight: "1px solid",
                  borderRightColor: "divider",
                  backgroundColor: "transparent",
                }}
              >
                <Box
                  sx={{
                    position: "sticky",
                    top: 88,
                    zIndex: 2,
                    display: "flex",
                    justifyContent: "center",
                    pt: 1,
                  }}
                >
                  <IconButton
                    onClick={toggleDesktop}
                    aria-label="Abrir sidebar"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.paper",
                      boxShadow: "0 10px 30px rgba(0,0,0,.25)",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <FiChevronRight size={20} />
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: drawerWidth } }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 2 },
            py: { xs: 2, md: 2 },
          }}
        >
          {p.children}
        </Box>
      </Box>
    </Box>
  );
}

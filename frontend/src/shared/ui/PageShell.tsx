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
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useColorMode } from "../../app/theme/colorMode";

type NavItem = {
  key: string;
  label: string;
};

function ThemeIcon(p: { mode: "light" | "dark" }) {
  return <span style={{ fontSize: 18, lineHeight: 1 }}>{p.mode === "dark" ? "☾" : "☼"}</span>;
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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

  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = useMemo(() => {
    return p.navItems.find((x) => x.key === p.activeNavKey)?.label ?? "";
  }, [p.navItems, p.activeNavKey]);

  const drawer = (
    <Box className="h-full flex flex-col">
      <Box className="px-4 py-3">
        <Typography variant="subtitle2" color="text.secondary">
          Planta / Configuración
        </Typography>
      </Box>

      <Divider />

      <List disablePadding>
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
                px: 2.25,
                py: 1.25,
                borderLeft: selected ? "3px solid" : "3px solid transparent",
                borderLeftColor: selected ? "primary.main" : "transparent"
              }}
            >
              <ListItemText
                primary={x.label}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box className="flex-1" />
    </Box>
  );

  return (
    <Box className="min-h-screen">
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            {!mdUp && (
              <IconButton aria-label="open menu" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Box>
              <Typography variant="h6" fontWeight={800}>
                {p.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeLabel}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={cm.toggle} aria-label="toggle theme">
            <ThemeIcon mode={cm.mode} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box className="flex">
        {mdUp ? (
          <Drawer
            variant="permanent"
            open
            PaperProps={{
              sx: {
                width: drawerWidth,
                borderRight: "1px solid",
                borderRightColor: "divider",
                top: 0
              }
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 }
          }}
        >
          {p.children}
        </Box>
      </Box>
    </Box>
  );
}

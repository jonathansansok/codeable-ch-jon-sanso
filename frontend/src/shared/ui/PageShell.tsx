import { AppBar, Box, Container, IconButton, Toolbar, Typography } from "@mui/material";
import { useColorMode } from "../../app/theme/colorMode";

function ThemeIcon(p: { mode: "light" | "dark" }) {
  return (
    <span style={{ fontSize: 18, lineHeight: 1 }}>
      {p.mode === "dark" ? "☾" : "☀"}
    </span>
  );
}

export function PageShell(p: { title: string; children: React.ReactNode }) {
  const cm = useColorMode();

  return (
    <Box className="min-h-screen">
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar className="flex items-center justify-between">
          <Typography variant="h6" fontWeight={700}>
            {p.title}
          </Typography>

          <IconButton onClick={cm.toggle} aria-label="toggle theme">
            <ThemeIcon mode={cm.mode} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className="py-6">
        {p.children}
      </Container>
    </Box>
  );
}

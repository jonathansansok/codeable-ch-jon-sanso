import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import type { PlantOpRow, Tier } from "../../../types/domain";
import { TIERS, num, tierLabel } from "../utils/tiers";
import { parseMargin } from "../validation/margin";

function AddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RowItem =
  | { kind: "group"; id: string; label: string; count: number }
  | { kind: "row"; id: string; row: PlantOpRow };

function groupKey(name: string) {
  const c = (name || "A").trim().toUpperCase().charCodeAt(0);
  if (c <= "I".charCodeAt(0)) return "Tipo A";
  if (c <= "R".charCodeAt(0)) return "Tipo B";
  return "Tipo C";
}

export function PlantOperationsTable(p: {
  rows: PlantOpRow[];
  onCommit: (opId: string, tier: Tier, nextValue: number, currentValue: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const tiers = useMemo(() => TIERS, []);

  const items = useMemo<RowItem[]>(() => {
    const buckets = new Map<string, PlantOpRow[]>();
    for (const r of p.rows) {
      const g = groupKey(r.operation.name);
      const arr = buckets.get(g) ?? [];
      arr.push(r);
      buckets.set(g, arr);
    }

    const order = ["Tipo A", "Tipo B", "Tipo C"];
    const out: RowItem[] = [];
    for (const g of order) {
      const arr = buckets.get(g);
      if (!arr || arr.length === 0) continue;
      out.push({ kind: "group", id: `g:${g}`, label: g, count: arr.length });
      for (const r of arr) out.push({ kind: "row", id: r.id, row: r });
    }
    return out;
  }, [p.rows]);

  const col1 = 280;
  const col2 = 140;
  const col3 = 170;

  return (
    <Paper elevation={0} variant="outlined" className="overflow-hidden">
      <TableContainer className="w-full" sx={{ maxHeight: { xs: 520, md: 720 } }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1180 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 4,
                  minWidth: col1,
                  backgroundColor: "grey.900",
                  color: "common.white",
                  fontWeight: 800
                }}
              >
                Tipo de cliente
              </TableCell>

              <TableCell
                sx={{
                  position: "sticky",
                  left: col1,
                  zIndex: 4,
                  minWidth: col2,
                  backgroundColor: "grey.900",
                  color: "common.white",
                  fontWeight: 800
                }}
              >
                Classe x color
              </TableCell>

              <TableCell
                sx={{
                  position: "sticky",
                  left: col1 + col2,
                  zIndex: 4,
                  minWidth: col3,
                  backgroundColor: "grey.900",
                  color: "common.white",
                  fontWeight: 800
                }}
              >
                Vincular precio
              </TableCell>

              {tiers.map((t) => (
                <TableCell
                  key={t}
                  align="center"
                  sx={{
                    minWidth: 96,
                    backgroundColor: "grey.900",
                    color: "common.white",
                    fontWeight: 800
                  }}
                >
                  {tierLabel(t)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((it, idx) => {
              if (it.kind === "group") {
                return (
                  <TableRow key={it.id} hover={false}>
                    <TableCell
                      colSpan={3 + tiers.length}
                      sx={{
                        backgroundColor: "action.hover",
                        borderBottom: "1px solid",
                        borderBottomColor: "divider"
                      }}
                    >
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center gap-2">
                          <Typography fontWeight={900}>{it.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {it.count} clientes
                          </Typography>
                        </Box>
                        <IconButton size="small" aria-label="add">
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              }

              const r = it.row;
              const zebra = idx % 2 === 0;

              const marginByTier = new Map<Tier, number>();
              r.margins.forEach((m) => marginByTier.set(m.tier, num(m.marginPercent)));

              return (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    backgroundColor: zebra ? "background.default" : "action.hover"
                  }}
                >
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                      minWidth: col1,
                      backgroundColor: zebra ? "background.default" : "action.hover",
                      borderRight: "1px solid",
                      borderRightColor: "divider"
                    }}
                  >
                    <Box className="flex items-center justify-between gap-2">
                      <Box className="min-w-0">
                        <Typography fontWeight={800} noWrap>
                          {r.operation.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {r.operation.id}
                        </Typography>
                      </Box>

                      <IconButton size="small" aria-label="edit">
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      position: "sticky",
                      left: col1,
                      zIndex: 2,
                      minWidth: col2,
                      backgroundColor: zebra ? "background.default" : "action.hover",
                      borderRight: "1px solid",
                      borderRightColor: "divider"
                    }}
                  >
                    {num(r.operation.basePriceUsd).toFixed(2)} USD
                  </TableCell>

                  <TableCell
                    sx={{
                      position: "sticky",
                      left: col1 + col2,
                      zIndex: 2,
                      minWidth: col3,
                      backgroundColor: zebra ? "background.default" : "action.hover",
                      borderRight: "1px solid",
                      borderRightColor: "divider"
                    }}
                  >
                    {r.operation.linkMode === "BY_STRUCTURE" ? "Por estructura" : "No vincular"}
                  </TableCell>

                  {tiers.map((t) => {
                    const key = `${r.operation.id}:${t}`;
                    const current = marginByTier.get(t) ?? 0;
                    const value = draft[key] ?? String(current);

                    const parsed = parseMargin(value);
                    const isValid = parsed.ok;
                    const nextValue = parsed.ok ? parsed.value : current;
                    const isLow = isValid && nextValue <= 5;

                    return (
                      <TableCell key={t} align="center">
                        <Tooltip
                          arrow
                          placement="top"
                          open={isLow}
                          title="El número no puede ser menor a 5%"
                        >
                          <Box>
                            <TextField
                              value={value}
                              size="small"
                              inputMode="decimal"
                              type="number"
                              onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                              onBlur={async () => {
                                const raw = draft[key];
                                if (raw == null) return;

                                const parsed2 = parseMargin(raw);
                                if (!parsed2.ok) return;

                                if (parsed2.value === current) {
                                  setDraft((prev) => {
                                    const c = { ...prev };
                                    delete c[key];
                                    return c;
                                  });
                                  return;
                                }

                                await p.onCommit(r.operation.id, t, parsed2.value, current);

                                setDraft((prev) => {
                                  const c = { ...prev };
                                  delete c[key];
                                  return c;
                                });
                              }}
                              error={!isValid}
                              helperText={!isValid ? parsed.message : " "}
                              sx={{
                                width: 92,
                                "& .MuiInputBase-input": { textAlign: "center" },
                                ...(isLow
                                  ? { "& .MuiOutlinedInput-root": { backgroundColor: "rgba(244, 67, 54, 0.10)" } }
                                  : {})
                              }}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

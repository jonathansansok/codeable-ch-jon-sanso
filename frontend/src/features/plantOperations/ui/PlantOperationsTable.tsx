import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type { PlantOpRow, Tier } from "../../../types/domain";
import { TIERS, num, tierLabel } from "../utils/tiers";
import { parseMargin } from "../validation/margin";

export function PlantOperationsTable(p: {
  rows: PlantOpRow[];
  onCommit: (opId: string, tier: Tier, nextValue: number, currentValue: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  const tiers = useMemo(() => TIERS, []);

  return (
    <Paper elevation={0} variant="outlined" className="overflow-hidden">
      <TableContainer className="w-full" sx={{ maxHeight: { xs: 520, md: 720 } }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ position: "sticky", left: 0, zIndex: 2, backgroundColor: "background.paper", minWidth: 240 }}>
                Tipo / Operación
              </TableCell>
              <TableCell sx={{ minWidth: 120 }}>Classe x color</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Vincular precio</TableCell>
              {tiers.map((t) => (
                <TableCell key={t} align="center" sx={{ minWidth: 96 }}>
                  {tierLabel(t)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {p.rows.map((r) => {
              const marginByTier = new Map<Tier, number>();
              r.margins.forEach((m) => marginByTier.set(m.tier, num(m.marginPercent)));

              return (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ position: "sticky", left: 0, backgroundColor: "background.paper", zIndex: 1 }}>
                    <Typography fontWeight={700}>{r.operation.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.operation.id}
                    </Typography>
                  </TableCell>

                  <TableCell>{num(r.operation.basePriceUsd).toFixed(2)} USD</TableCell>
                  <TableCell>{r.operation.linkMode === "BY_STRUCTURE" ? "Por estructura" : "No vincular"}</TableCell>

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
                                  ? {
                                      "& .MuiOutlinedInput-root": {
                                        backgroundColor: "rgba(244, 67, 54, 0.10)",
                                      },
                                    }
                                  : {}),
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

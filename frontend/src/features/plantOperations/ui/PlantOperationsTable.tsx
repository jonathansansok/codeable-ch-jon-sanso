import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
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
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const UPSERT_OPERATION = gql`
  mutation UpsertOperation($input: UpsertOperationInput!) {
    upsertOperation(input: $input) {
      id
      name
      basePriceUsd
      linkMode
    }
  }
`;

const ENSURE_PLANT_OPERATION = gql`
  mutation EnsurePlantOperation($plantId: ID!, $operationId: ID!) {
    ensurePlantOperation(plantId: $plantId, operationId: $operationId) {
      id
    }
  }
`;

type LinkMode = "NONE" | "BY_STRUCTURE";

type UpsertOperationInput = {
  id?: string;
  name: string;
  basePriceUsd: number;
  linkMode: LinkMode;
};

type UpsertOperationData = {
  upsertOperation: {
    id: string;
    name: string;
    basePriceUsd: number;
    linkMode: LinkMode;
  };
};

type UpsertOperationVars = {
  input: UpsertOperationInput;
};

type EnsurePlantOperationData = {
  ensurePlantOperation: { id: string };
};

type EnsurePlantOperationVars = {
  plantId: string;
  operationId: string;
};

type RowItem =
  | { kind: "group"; id: string; label: string; count: number }
  | { kind: "row"; id: string; row: PlantOpRow };

function groupKey(name: string) {
  const c = (name || "A").trim().toUpperCase().charCodeAt(0);
  if (c <= "I".charCodeAt(0)) return "Tipo A";
  if (c <= "R".charCodeAt(0)) return "Tipo B";
  return "Tipo C";
}

type OpFormMode = "create" | "edit";

type OpFormState = {
  open: boolean;
  mode: OpFormMode;
  opId: string | null;
  name: string;
  basePriceUsd: string;
  linkMode: LinkMode;
  error: string | null;
};

function initOpForm(): OpFormState {
  return {
    open: false,
    mode: "create",
    opId: null,
    name: "",
    basePriceUsd: "0",
    linkMode: "NONE",
    error: null
  };
}

function normalizeName(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

function parseUsd(raw: string) {
  const t = raw.trim();
  if (t === "") return { ok: true as const, value: 0 };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false as const, message: "Base USD inválido" };
  if (n < 0) return { ok: false as const, message: "Base USD no puede ser negativo" };
  return { ok: true as const, value: n };
}

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  return String(e);
}

function clipTextForCopy(v: unknown) {
  const s = String(v ?? "");
  return s.trim();
}

function buildOpDebugText(r: PlantOpRow, tiers: Tier[]) {
  const lines: string[] = [];
  lines.push(`id: ${clipTextForCopy(r.operation.id)}`);
  lines.push(`name: ${clipTextForCopy(r.operation.name)}`);
  lines.push(`basePriceUsd: ${num(r.operation.basePriceUsd)}`);
  lines.push(`linkMode: ${clipTextForCopy(r.operation.linkMode)}`);

  const marginByTier = new Map<Tier, number>();
  for (const m of r.margins) marginByTier.set(m.tier, num(m.marginPercent));

  lines.push("");
  lines.push("margins:");
  for (const t of tiers) {
    const v = marginByTier.get(t) ?? 0;
    lines.push(`  ${t}: ${v}`);
  }

  return lines.join("\n");
}

export function PlantOperationsTable(p: {
  plantId: string;
  rows: PlantOpRow[];
  onCommit: (opId: string, tier: Tier, nextValue: number, currentValue: number) => Promise<void>;
  onRefetch: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const tiers = useMemo(() => TIERS, []);
  const [opForm, setOpForm] = useState<OpFormState>(() => initOpForm());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [upsertOperation, upsertM] = useMutation<UpsertOperationData, UpsertOperationVars>(
    UPSERT_OPERATION
  );
  const [ensurePlantOperation, ensureM] = useMutation<
    EnsurePlantOperationData,
    EnsurePlantOperationVars
  >(ENSURE_PLANT_OPERATION);

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

  const savingStructure = upsertM.loading || ensureM.loading;

  function openCreate() {
    setOpForm({
      open: true,
      mode: "create",
      opId: null,
      name: "",
      basePriceUsd: "0",
      linkMode: "NONE",
      error: null
    });
  }

  function openEdit(r: PlantOpRow) {
    setOpForm({
      open: true,
      mode: "edit",
      opId: r.operation.id,
      name: r.operation.name ?? "",
      basePriceUsd: String(num(r.operation.basePriceUsd)),
      linkMode: r.operation.linkMode as LinkMode,
      error: null
    });
  }

  async function copyOpDebug(r: PlantOpRow) {
    const text = buildOpDebugText(r, tiers);
    const id = String(r.operation.id ?? "");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      window.setTimeout(() => setCopiedKey((prev) => (prev === id ? null : prev)), 1400);
    } catch {
      setCopiedKey(null);
    }
  }

  async function submitOpForm() {
    const name = normalizeName(opForm.name);
    if (!name) {
      setOpForm((prev) => ({ ...prev, error: "Nombre requerido" }));
      return;
    }
    if (name.length > 160) {
      setOpForm((prev) => ({ ...prev, error: "Nombre excede 160 caracteres" }));
      return;
    }

    const usd = parseUsd(opForm.basePriceUsd);
    if (!usd.ok) {
      setOpForm((prev) => ({ ...prev, error: usd.message }));
      return;
    }

    const input: UpsertOperationInput = {
      ...(opForm.opId ? { id: opForm.opId } : {}),
      name,
      basePriceUsd: usd.value,
      linkMode: opForm.linkMode
    };

    setOpForm((prev) => ({ ...prev, error: null }));

    try {
      const res = await upsertOperation({ variables: { input } });

      const operationId = String(res.data?.upsertOperation?.id ?? "");
      if (!operationId) {
        setOpForm((prev) => ({ ...prev, error: "No se pudo guardar la operación" }));
        return;
      }

      if (opForm.mode === "create") {
        await ensurePlantOperation({ variables: { plantId: p.plantId, operationId } });
      }

      await p.onRefetch();

      setOpForm((prev) => ({ ...prev, open: false }));
    } catch (e: unknown) {
      setOpForm((prev) => ({ ...prev, error: errMsg(e) }));
    }
  }

  const lowMarginTip = (
    <Box sx={{ whiteSpace: "pre-line", textAlign: "center" }}>
      El número no puede{"\n"}ser menor a 5%
    </Box>
  );

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

                        <IconButton
                          size="small"
                          aria-label="add"
                          onClick={openCreate}
                          disabled={savingStructure}
                        >
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

              const opId = String(r.operation.id ?? "");
              const copied = copiedKey === opId;

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
                    <Box className="flex items-start justify-between gap-2">
                      <Box className="min-w-0">
                        <Typography fontWeight={800} noWrap>
                          {r.operation.name}
                        </Typography>

                        <Box className="flex items-center gap-1.25 min-w-0">
                          <Typography variant="caption" color="text.secondary" noWrap>
                            id: {opId}
                          </Typography>

                          <Tooltip
                            arrow
                            placement="top"
                            title={copied ? "Copiado" : "Copiar id + headers"}
                          >
                            <IconButton
                              size="small"
                              aria-label="copy"
                              onClick={() => copyOpDebug(r)}
                              disabled={savingStructure}
                              sx={{ ml: 0.25 }}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => openEdit(r)}
                        disabled={savingStructure}
                      >
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

                    const wasTouched = Boolean(touched[key]);
                    const showLowTip = wasTouched && isLow;

                    return (
                      <TableCell key={t} align="center">
                        <Tooltip
                          arrow
                          placement="top"
                          open={showLowTip}
                          disableHoverListener
                          disableFocusListener
                          disableTouchListener
                          title={lowMarginTip}
                        >
                          <Box>
                            <TextField
                              value={value}
                              size="small"
                              type="text"
                              inputMode="decimal"
                              onFocus={() => {
                                if (!touched[key]) {
                                  setTouched((prev) => ({ ...prev, [key]: true }));
                                }
                              }}
                              onChange={(e) => {
                                if (!touched[key]) {
                                  setTouched((prev) => ({ ...prev, [key]: true }));
                                }
                                setDraft((prev) => ({ ...prev, [key]: e.target.value }));
                              }}
                              onBlur={async () => {
                                if (!touched[key]) {
                                  setTouched((prev) => ({ ...prev, [key]: true }));
                                }

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
                                  setTouched((prev) => {
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
                                setTouched((prev) => {
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
                                        backgroundColor: "rgba(244, 67, 54, 0.10)"
                                      }
                                    }
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

      <Dialog
        open={opForm.open}
        onClose={() => setOpForm((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {opForm.mode === "create" ? "Nueva operación" : "Editar operación"}
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Box className="grid grid-cols-1 gap-3">
            <TextField
              label="Nombre"
              value={opForm.name}
              onChange={(e) => setOpForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Base USD"
                value={opForm.basePriceUsd}
                onChange={(e) => setOpForm((prev) => ({ ...prev, basePriceUsd: e.target.value }))}
                fullWidth
                inputMode="decimal"
              />

              <FormControl fullWidth>
                <InputLabel id="linkmode-label">Vincular precio</InputLabel>
                <Select
                  labelId="linkmode-label"
                  label="Vincular precio"
                  value={opForm.linkMode}
                  onChange={(e) =>
                    setOpForm((prev) => ({ ...prev, linkMode: e.target.value as LinkMode }))
                  }
                >
                  <MenuItem value="NONE">No vincular</MenuItem>
                  <MenuItem value="BY_STRUCTURE">Por estructura</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {opForm.error && (
              <Typography color="error" variant="body2" sx={{ fontWeight: 700 }}>
                {opForm.error}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpForm((prev) => ({ ...prev, open: false }))}
            disabled={savingStructure}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={submitOpForm}
            disabled={savingStructure}
            sx={{ fontWeight: 900 }}
          >
            {savingStructure ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { OpFormState } from "./operationFormState";

type LinkMode = "NONE" | "BY_STRUCTURE";

export function OperationFormDialog(p: {
  state: OpFormState;
  saving: boolean;
  onClose: () => void;
  onChange: (next: OpFormState) => void;
  onSubmit: () => void;
}) {
  const s = p.state;

  const fieldSx = {
    "& .MuiInputBase-root": { borderRadius: 2 },
    "& .MuiOutlinedInput-input": { py: 1.25 },
    "& .MuiSelect-select": { py: 1.25 },
  } as const;

  return (
    <Dialog
      open={s.open}
      onClose={p.onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 950, px: 4, pt: 3, pb: 2 }}>
        {s.mode === "create" ? "Nueva operación" : "Editar operación"}
      </DialogTitle>

      <Divider sx={{ mx: 4, borderColor: "common.white", opacity: 0.9 }} />

      <DialogContent sx={{ px: 4, pt: 3, pb: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.25 }}>
          <TextField
            label="Nombre"
            value={s.name}
            onChange={(e) => p.onChange({ ...s, name: e.target.value })}
            fullWidth
            autoFocus
            sx={fieldSx}
          />

          <TextField
            label="Base USD"
            value={s.basePriceUsd}
            onChange={(e) => p.onChange({ ...s, basePriceUsd: e.target.value })}
            fullWidth
            inputMode="decimal"
            sx={fieldSx}
          />

          <FormControl fullWidth sx={fieldSx}>
            <InputLabel id="linkmode-label">Vincular precio</InputLabel>
            <Select
              labelId="linkmode-label"
              label="Vincular precio"
              value={s.linkMode}
              onChange={(e) =>
                p.onChange({ ...s, linkMode: e.target.value as LinkMode })
              }
            >
              <MenuItem value="NONE">No vincular</MenuItem>
              <MenuItem value="BY_STRUCTURE">Por estructura</MenuItem>
            </Select>
          </FormControl>

          {s.error && (
            <Typography color="error" variant="body2" sx={{ fontWeight: 800 }}>
              {s.error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 2.25, gap: 1.5 }}>
        <Button
          onClick={p.onClose}
          disabled={p.saving}
          variant="outlined"
          color="inherit"
          sx={{ fontWeight: 900, borderRadius: 2, px: 2.5, py: 1.1 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={p.onSubmit}
          disabled={p.saving}
          sx={{ fontWeight: 950, borderRadius: 2, px: 3, py: 1.1 }}
        >
          {p.saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

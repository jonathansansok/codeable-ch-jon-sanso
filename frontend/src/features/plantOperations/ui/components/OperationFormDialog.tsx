import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
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
          borderColor: "divider"
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 950 }}>
        {s.mode === "create" ? "Nueva operación" : "Editar operación"}
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Box className="grid grid-cols-1 gap-3">
          <TextField
            label="Nombre"
            value={s.name}
            onChange={(e) => p.onChange({ ...s, name: e.target.value })}
            fullWidth
            autoFocus
          />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              label="Base USD"
              value={s.basePriceUsd}
              onChange={(e) => p.onChange({ ...s, basePriceUsd: e.target.value })}
              fullWidth
              inputMode="decimal"
            />

            <FormControl fullWidth>
              <InputLabel id="linkmode-label">Vincular precio</InputLabel>
              <Select
                labelId="linkmode-label"
                label="Vincular precio"
                value={s.linkMode}
                onChange={(e) => p.onChange({ ...s, linkMode: e.target.value as LinkMode })}
              >
                <MenuItem value="NONE">No vincular</MenuItem>
                <MenuItem value="BY_STRUCTURE">Por estructura</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {s.error && (
            <Typography color="error" variant="body2" sx={{ fontWeight: 800 }}>
              {s.error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={p.onClose}
          disabled={p.saving}
          variant="outlined"
          color="inherit"
          sx={{ fontWeight: 900, borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={p.onSubmit}
          disabled={p.saving}
          sx={{ fontWeight: 950, borderRadius: 2 }}
        >
          {p.saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import type { PlantOpRow } from "../../../../types/domain";

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
      <path d="M9 9h10v10H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OperationCellHeader(p: {
  row: PlantOpRow;
  copied: boolean;
  disabled: boolean;
  onCopy: (r: PlantOpRow) => void;
  onEdit: (r: PlantOpRow) => void;
}) {
  const opId = String(p.row.operation.id ?? "");

  return (
    <Box className="flex items-start justify-between gap-2">
      <Box className="min-w-0">
        <Typography fontWeight={800} noWrap>
          {p.row.operation.name}
        </Typography>

        <Box className="flex items-center gap-1.25 min-w-0">
          <Typography variant="caption" color="text.secondary" noWrap>
            id: {opId}
          </Typography>

          <Tooltip arrow placement="top" title={p.copied ? "Copiado" : "Copiar id + headers"}>
            <IconButton
              size="small"
              aria-label="copy"
              onClick={() => p.onCopy(p.row)}
              disabled={p.disabled}
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
        onClick={() => p.onEdit(p.row)}
        disabled={p.disabled}
      >
        <EditIcon />
      </IconButton>
    </Box>
  );
}

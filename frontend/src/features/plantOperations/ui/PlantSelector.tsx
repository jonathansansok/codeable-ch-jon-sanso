import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { Plant } from "../../../types/domain";

export function PlantSelector(p: {
  plants: Plant[];
  value: string;
  onChange: (plantId: string) => void;
}) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="plant-select-label">Planta</InputLabel>
      <Select
        labelId="plant-select-label"
        label="Planta"
        value={p.value}
        onChange={(e) => p.onChange(String(e.target.value))}
      >
        {p.plants.map((x) => (
          <MenuItem key={x.id} value={x.id}>
            {x.name} {x.code ? `(${x.code})` : ""}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

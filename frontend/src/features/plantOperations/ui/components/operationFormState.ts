//frontend\src\features\plantOperations\ui\components\operationFormState.ts
type LinkMode = "NONE" | "BY_STRUCTURE";
type OpFormMode = "create" | "edit";

export type OpFormState = {
  open: boolean;
  mode: OpFormMode;
  opId: string | null;
  name: string;
  basePriceUsd: string;
  linkMode: LinkMode;
  error: string | null;
};

export function initOpForm(): OpFormState {
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

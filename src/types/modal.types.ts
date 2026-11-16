export type ModalState =
  | { kind: "join" }
  | { kind: "activity"; index: number }
  | { kind: "gallery"; index: number }
  | { kind: "members" }
  | { kind: "privacy" }
  | { kind: "terms" }
  | null;

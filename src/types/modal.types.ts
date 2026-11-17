export type ModalState =
  | { kind: "welcome" }
  | { kind: "join" }
  | { kind: "activity"; index: number }
  | { kind: "gallery"; index: number }
  | { kind: "members" }
  | { kind: "privacy" }
  | { kind: "terms" }
  | null;

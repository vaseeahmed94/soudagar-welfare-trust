export type ModalState =
  | { kind: "donation" }
  | { kind: "welcome" }
  | { kind: "join" }
  | { kind: "activity"; index: number }
  | { kind: "gallery"; index: number }
  | { kind: "members" }
  | { kind: "contributions" }
  | { kind: "privacy" }
  | { kind: "terms" }
  | null;

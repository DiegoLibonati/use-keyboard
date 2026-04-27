export interface KeyModifiers {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export interface KeyConfig {
  key: string;
  fn: (e: KeyboardEvent) => void;
  modifiers?: KeyModifiers;
}

export interface UseKeyboard {
  keysLoaded: string[];
}

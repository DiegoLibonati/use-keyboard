import type { KeyConfig } from "@/types/app";

export interface UseKeyboardProps {
  config: {
    keys: KeyConfig[];
    dependencies: React.DependencyList;
    debug?: boolean;
    enabled?: boolean;
    trigger?: "keydown" | "keyup" | "both";
  };
}

export interface KeyboardDemoProps {
  debug: boolean;
  enabled: boolean;
  trigger: "keydown" | "keyup" | "both";
}

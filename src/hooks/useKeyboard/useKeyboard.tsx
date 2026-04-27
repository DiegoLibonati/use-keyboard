import { useCallback, useEffect, useState } from "react";

import type { UseKeyboard, KeyModifiers } from "@/types/app";
import type { UseKeyboardProps } from "@/types/props";

const matchesModifiers = (e: KeyboardEvent, modifiers?: KeyModifiers): boolean => {
  if (!modifiers) return true;
  if (modifiers.ctrl !== undefined && modifiers.ctrl !== e.ctrlKey) return false;
  if (modifiers.shift !== undefined && modifiers.shift !== e.shiftKey) return false;
  if (modifiers.alt !== undefined && modifiers.alt !== e.altKey) return false;
  if (modifiers.meta !== undefined && modifiers.meta !== e.metaKey) return false;
  return true;
};

export const useKeyboard = ({ config }: UseKeyboardProps): UseKeyboard => {
  const [keysLoaded, setKeysLoaded] = useState<string[]>([]);

  const { keys, debug = false, dependencies, enabled = true, trigger = "keydown" } = config;

  const onKeyPress = useCallback(
    (e: KeyboardEvent) => {
      keys.forEach((element) => {
        if (!matchesModifiers(e, element.modifiers)) return;

        if (element.key === "|" && e.key === element.key) {
          element.fn(e);
          return;
        }

        if (element.key.includes("|")) {
          const multipleKeys = element.key.split("|").filter((key) => key);
          if (multipleKeys.length < 2) return;
          if (multipleKeys.includes(e.key)) element.fn(e);
          return;
        }

        if (e.key === element.key) {
          element.fn(e);
        }
      });
    },
    [keys, ...dependencies]
  );

  useEffect(() => {
    if (!enabled) return;

    if (trigger === "keydown" || trigger === "both") window.addEventListener("keydown", onKeyPress);
    if (trigger === "keyup" || trigger === "both") window.addEventListener("keyup", onKeyPress);

    return (): void => {
      window.removeEventListener("keydown", onKeyPress);
      window.removeEventListener("keyup", onKeyPress);
    };
  }, [onKeyPress, enabled, trigger]);

  useEffect(() => {
    const mapped = keys.map((k) => k.key);
    setKeysLoaded((prev) =>
      prev.length === mapped.length && prev.every((k, i) => k === mapped[i]) ? prev : mapped
    );
  }, [keys]);

  useEffect(() => {
    if (!debug) return;

    if (keys.length === 0) {
      console.log("No keys have been added to the key Array ✅.");
      return;
    }

    keys.forEach((element) => {
      if (element.key === "|") {
        console.log(`Key %c${element.key}%c loaded ✅.`, "color: #09f", "color: initial");
        return;
      }

      if (element.key.includes("|")) {
        const multipleKeys = element.key.split("|").filter((key) => key);

        if (multipleKeys.length < 2) {
          console.log(
            `If you use the key field with | it is to pass multiple keys with the same function. I regret to inform you that the key %c${element.key}%c was not loaded successfully ❌.`,
            "color: red",
            "color: initial"
          );
          return;
        }

        multipleKeys.forEach((key) => {
          console.log(`Key %c${key}%c loaded ✅.`, "color: #09f", "color: initial");
        });
        return;
      }

      const modLabel = element.modifiers
        ? Object.entries(element.modifiers)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join("+") + "+"
        : "";

      console.log(`Key %c${modLabel}${element.key}%c loaded ✅.`, "color: #09f", "color: initial");
    });
  }, [debug, keys]);

  return { keysLoaded };
};

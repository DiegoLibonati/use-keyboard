import { useMemo, useState } from "react";

import type { JSX } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { KeyboardDemoProps } from "@/types/props";
import type { KeyConfig } from "@/types/app";

import { useKeyboard } from "@/hooks/useKeyboard/useKeyboard";

type Story = StoryObj<typeof KeyboardDemo>;

const KeyboardDemo = ({ debug, enabled, trigger }: KeyboardDemoProps): JSX.Element => {
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<"keydown" | "keyup" | null>(null);

  const keys = useMemo<KeyConfig[]>(
    (): KeyConfig[] => [
      {
        key: "a",
        fn: (e): void => {
          setLastKey(e.key);
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
      {
        key: "b",
        fn: (e): void => {
          setLastKey(e.key);
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
      {
        key: "c",
        fn: (e): void => {
          setLastKey(e.key);
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
      {
        key: "Enter",
        fn: (e): void => {
          setLastKey(e.key);
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
      {
        key: "Escape",
        fn: (e): void => {
          setLastKey(e.key);
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
      {
        key: "ArrowUp|ArrowDown",
        fn: (e): void => {
          setLastKey(e.key);
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
      {
        key: "k",
        modifiers: { ctrl: true },
        fn: (e): void => {
          setLastKey("Ctrl+k");
          setLastEvent(e.type as "keydown" | "keyup");
        },
      },
    ],
    []
  );

  const { keysLoaded } = useKeyboard({
    config: { keys, dependencies: [], debug, enabled, trigger },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "1.5rem",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <p>
          Last key: <strong>{lastKey ?? "—"}</strong>
        </p>
        <p>
          Event: <strong>{lastEvent ?? "—"}</strong>
        </p>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}
      >
        <span>Loaded keys:</span>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {keysLoaded.map((key) => (
            <kbd
              key={key}
              style={{
                padding: "0.2rem 0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background:
                  lastKey === key ||
                  (key === "ArrowUp|ArrowDown" &&
                    (lastKey === "ArrowUp" || lastKey === "ArrowDown")) ||
                  (key === "k" && lastKey === "Ctrl+k")
                    ? "#09f"
                    : "#f5f5f5",
                color:
                  lastKey === key ||
                  (key === "ArrowUp|ArrowDown" &&
                    (lastKey === "ArrowUp" || lastKey === "ArrowDown")) ||
                  (key === "k" && lastKey === "Ctrl+k")
                    ? "#fff"
                    : "inherit",
                fontFamily: "monospace",
                opacity: enabled ? 1 : 0.4,
              }}
            >
              {key === "k" ? "Ctrl+k" : key}
            </kbd>
          ))}
        </div>
      </div>

      {!enabled && (
        <p style={{ color: "#f55", fontSize: "0.85rem" }}>Listener disabled — keys won't fire.</p>
      )}

      <p style={{ color: "#888", fontSize: "0.85rem" }}>Click here and press any listed key.</p>
    </div>
  );
};

const meta: Meta<typeof KeyboardDemo> = {
  title: "Hooks/useKeyboard",
  component: KeyboardDemo,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    debug: { control: "boolean" },
    enabled: { control: "boolean" },
    trigger: { control: "select", options: ["keydown", "keyup", "both"] },
  },
};

export const Default: Story = {
  args: { debug: false, enabled: true, trigger: "keydown" },
};

export const WithDebug: Story = {
  args: { debug: true, enabled: true, trigger: "keydown" },
};

export const Disabled: Story = {
  args: { debug: false, enabled: false, trigger: "keydown" },
};

export const KeyupTrigger: Story = {
  args: { debug: false, enabled: true, trigger: "keyup" },
};

export const BothTriggers: Story = {
  args: { debug: false, enabled: true, trigger: "both" },
};

export default meta;

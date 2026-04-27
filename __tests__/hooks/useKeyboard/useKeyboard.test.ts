import { renderHook } from "@testing-library/react";

import type { KeyConfig } from "@/types/app";
import type { UseKeyboardProps } from "@/types/props";

import { useKeyboard } from "@/hooks/useKeyboard/useKeyboard";

const EMPTY_KEYS: KeyConfig[] = [];

const dispatchKey = (
  type: "keydown" | "keyup",
  key: string,
  modifiers: Partial<{
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
  }> = {}
): void => {
  window.dispatchEvent(new KeyboardEvent(type, { key, ...modifiers }));
};

const buildProps = (
  keys: KeyConfig[],
  overrides: Omit<Partial<UseKeyboardProps["config"]>, "keys"> = {}
): UseKeyboardProps => ({
  config: {
    keys,
    dependencies: [],
    ...overrides,
  },
});

describe("useKeyboard", () => {
  describe("keysLoaded", () => {
    it("should return an empty array when no keys are configured", () => {
      const { result } = renderHook(() => useKeyboard(buildProps(EMPTY_KEYS)));
      expect(result.current.keysLoaded).toEqual([]);
    });

    it("should return the key strings when keys are configured", () => {
      const keys: KeyConfig[] = [
        { key: "a", fn: jest.fn() },
        { key: "b", fn: jest.fn() },
      ];
      const { result } = renderHook(() => useKeyboard(buildProps(keys)));
      expect(result.current.keysLoaded).toEqual(["a", "b"]);
    });

    it("should update keysLoaded when the keys prop changes", () => {
      const initialKeys: KeyConfig[] = [{ key: "a", fn: jest.fn() }];
      const updatedKeys: KeyConfig[] = [
        { key: "a", fn: jest.fn() },
        { key: "b", fn: jest.fn() },
      ];
      const { result, rerender } = renderHook(
        ({ keys }: { keys: KeyConfig[] }) => useKeyboard(buildProps(keys)),
        { initialProps: { keys: initialKeys } }
      );
      expect(result.current.keysLoaded).toEqual(["a"]);
      rerender({ keys: updatedKeys });
      expect(result.current.keysLoaded).toEqual(["a", "b"]);
    });
  });

  describe("event registration", () => {
    it("should register a keydown listener by default", () => {
      const addSpy = jest.spyOn(window, "addEventListener");
      renderHook(() => useKeyboard(buildProps(EMPTY_KEYS)));
      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("should register a keyup listener when trigger is keyup", () => {
      const addSpy = jest.spyOn(window, "addEventListener");
      renderHook(() => useKeyboard(buildProps(EMPTY_KEYS, { trigger: "keyup" })));
      expect(addSpy).toHaveBeenCalledWith("keyup", expect.any(Function));
      expect(addSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("should register both keydown and keyup listeners when trigger is both", () => {
      const addSpy = jest.spyOn(window, "addEventListener");
      renderHook(() => useKeyboard(buildProps(EMPTY_KEYS, { trigger: "both" })));
      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("should not register listeners when enabled is false", () => {
      const addSpy = jest.spyOn(window, "addEventListener");
      renderHook(() => useKeyboard(buildProps(EMPTY_KEYS, { enabled: false })));
      expect(addSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(addSpy).not.toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("should remove the keydown listener on unmount", () => {
      const removeSpy = jest.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() => useKeyboard(buildProps(EMPTY_KEYS)));
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("should remove the keyup listener on unmount when trigger is keyup", () => {
      const removeSpy = jest.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() =>
        useKeyboard(buildProps(EMPTY_KEYS, { trigger: "keyup" }))
      );
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });
  });

  describe("key matching", () => {
    it("should call fn when the matching key is pressed", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should not call fn when a non-matching key is pressed", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "b");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should call fn when the literal pipe key is pressed", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "|", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "|");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call fn for any key in a pipe-separated list", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a|b", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a");
      dispatchKey("keydown", "b");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should not call fn for a non-matching key against a pipe-separated list", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a|b", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "c");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should not call fn for an invalid pipe-separated key with only one segment", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a|", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should not call fn when enabled is false", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys, { enabled: false })));
      dispatchKey("keydown", "a");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should call fn on keyup when trigger is keyup", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys, { trigger: "keyup" })));
      dispatchKey("keyup", "a");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should not call fn on keydown when trigger is keyup", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys, { trigger: "keyup" })));
      dispatchKey("keydown", "a");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should call fn on both keydown and keyup when trigger is both", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys, { trigger: "both" })));
      dispatchKey("keydown", "a");
      dispatchKey("keyup", "a");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("modifier matching", () => {
    it("should call fn when the ctrl modifier matches", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn, modifiers: { ctrl: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a", { ctrlKey: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should not call fn when the required ctrl modifier is missing", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn, modifiers: { ctrl: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should call fn when the shift modifier matches", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "A", fn: mockFn, modifiers: { shift: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "A", { shiftKey: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call fn when the alt modifier matches", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn, modifiers: { alt: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a", { altKey: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call fn when the meta modifier matches", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn, modifiers: { meta: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a", { metaKey: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call fn regardless of pressed modifier keys when no modifiers are configured", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a", { ctrlKey: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should call fn when all required modifiers match", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn, modifiers: { ctrl: true, shift: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a", { ctrlKey: true, shiftKey: true });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should not call fn when only some of the required modifiers match", () => {
      const mockFn = jest.fn();
      const keys: KeyConfig[] = [{ key: "a", fn: mockFn, modifiers: { ctrl: true, shift: true } }];
      renderHook(() => useKeyboard(buildProps(keys)));
      dispatchKey("keydown", "a", { ctrlKey: true });
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe("debug mode", () => {
    it("should not log when debug is false", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const keys: KeyConfig[] = [{ key: "a", fn: jest.fn() }];
      renderHook(() => useKeyboard(buildProps(keys, { debug: false })));
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log a no-keys message when debug is true and the keys array is empty", () => {
      const consoleSpy = jest.spyOn(console, "log");
      renderHook(() => useKeyboard(buildProps(EMPTY_KEYS, { debug: true })));
      expect(consoleSpy).toHaveBeenCalledWith("No keys have been added to the key Array ✅.");
    });

    it("should log the key name when debug is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const keys: KeyConfig[] = [{ key: "a", fn: jest.fn() }];
      renderHook(() => useKeyboard(buildProps(keys, { debug: true })));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key %ca%c loaded ✅.",
        "color: #09f",
        "color: initial"
      );
    });

    it("should log the literal pipe key when debug is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const keys: KeyConfig[] = [{ key: "|", fn: jest.fn() }];
      renderHook(() => useKeyboard(buildProps(keys, { debug: true })));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key %c|%c loaded ✅.",
        "color: #09f",
        "color: initial"
      );
    });

    it("should log each key from a pipe-separated list when debug is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const keys: KeyConfig[] = [{ key: "a|b", fn: jest.fn() }];
      renderHook(() => useKeyboard(buildProps(keys, { debug: true })));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key %ca%c loaded ✅.",
        "color: #09f",
        "color: initial"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key %cb%c loaded ✅.",
        "color: #09f",
        "color: initial"
      );
    });

    it("should log an error for an invalid pipe-separated key when debug is true", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const keys: KeyConfig[] = [{ key: "a|", fn: jest.fn() }];
      renderHook(() => useKeyboard(buildProps(keys, { debug: true })));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("was not loaded successfully"),
        "color: red",
        "color: initial"
      );
    });

    it("should include the modifier label in the debug log", () => {
      const consoleSpy = jest.spyOn(console, "log");
      const keys: KeyConfig[] = [{ key: "a", fn: jest.fn(), modifiers: { ctrl: true } }];
      renderHook(() => useKeyboard(buildProps(keys, { debug: true })));
      expect(consoleSpy).toHaveBeenCalledWith(
        "Key %cctrl+a%c loaded ✅.",
        "color: #09f",
        "color: initial"
      );
    });
  });
});

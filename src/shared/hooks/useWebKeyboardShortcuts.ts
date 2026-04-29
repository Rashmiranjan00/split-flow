import { useEffect } from 'react';
import { Platform } from 'react-native';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  handler: () => void;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  preventDefault?: boolean;
}

/**
 * Web-only hook for keyboard shortcuts.
 * No-op on native platforms.
 *
 * @param shortcuts Array of shortcut configurations
 * @param enabled Whether shortcuts are active (default true)
 */
export function useWebKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || shortcuts.length === 0) return;

    const handleKeyDown: KeyHandler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        // For modifier shortcuts, allow either Ctrl or Meta (Cmd on Mac)
        const modifierMatch =
          shortcut.ctrl || shortcut.meta ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;

        if (keyMatch && modifierMatch && shiftMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

import { useEffect } from 'react'
import type { ShortcutMap } from 'src/types/keyboard'

const shouldAllow = (element: HTMLElement) => {
  const tagName = element.tagName.toLowerCase()
  return !['input', 'textarea', 'select'].includes(tagName)
}

export const useKeyboardShortcuts = (
  shortcuts: ShortcutMap,
  allowOnInputElements = false
) => {
  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (!allowOnInputElements && !shouldAllow(e.target as HTMLElement)) {
        return
      }

      for (const shortcut of Object.values(shortcuts)) {
        const isModifierMatch =
          !!shortcut.cmd === e.metaKey &&
          !!shortcut.shift === e.shiftKey &&
          !!shortcut.alt === e.altKey

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          isModifierMatch
        ) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeypress)
    return () => window.removeEventListener('keydown', handleKeypress)
  }, [shortcuts, allowOnInputElements])
}

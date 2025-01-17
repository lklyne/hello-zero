interface KeyboardShortcut {
  key: string
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

export type ShortcutMap = Record<string, KeyboardShortcut>

import { onMounted, onUnmounted } from 'vue'

export interface KeyboardShortcuts {
  Delete?: () => void
  Escape?: () => void
  [key: string]: (() => void) | undefined
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key

    if (shortcuts[key]) {
      event.preventDefault()
      shortcuts[key]?.()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown,
  }
}

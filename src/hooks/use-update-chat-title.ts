import { useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const useUpdateChatTitle = () => {
  const generateTitle = useCallback(async (messages: Message[]) => {
    console.log('Generating title for messages:', messages)
    try {
      const response = await fetch('/api/claude/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        console.log('Title generation failed:', response.status)
        throw new Error('Failed to generate title')
      }

      const title = await response.text()
      console.log('Generated title:', title)
      return title.trim()
    } catch (error) {
      console.error('Error generating title:', error)
      return 'Untitled'
    }
  }, [])

  return { generateTitle }
}

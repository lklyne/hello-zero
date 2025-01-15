import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from '../schema'
// import { Button } from './ui/button'
import { randID } from '../rand'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  chatID: string
  timestamp: number
}

const Chat = ({ chatID }: { chatID: string }) => {
  const z = useZero<Schema>()
  const [isLoading, setIsLoading] = useState(false)

  const [messages] = useQuery(
    z.query.message.where('chatID', '=', chatID).orderBy('timestamp', 'desc')
  )

  const upsertMessage = (
    messageID: string,
    content: string,
    role: Message['role']
  ) => {
    z.mutate.message.upsert({
      id: messageID,
      content,
      chatID,
      role,
      timestamp: Date.now(),
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const content = formData.get('content') as string

    if (!content?.trim() || isLoading) {
      return
    }

    setIsLoading(true)
    const userMessageId = randID()
    upsertMessage(userMessageId, content, 'user')
    ;(e.target as HTMLFormElement).reset()

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          temperature: 0.7,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Stream response not available')
      }

      const reader = response.body.getReader()
      const assistantMessageId = randID()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        assistantMessage += text
        upsertMessage(assistantMessageId, assistantMessage, 'assistant')
      }
    } catch (error) {
      console.error('Error calling Claude:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 items-center h-full">
      <div className="flex flex-col gap-2 w-full h-full flex-grow">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded ${
                message.role === 'assistant' ? 'bg-gray-100' : 'bg-blue-100'
              }`}
            >
              {message.content}
            </div>
          ))
        ) : (
          <span>Empty thread</span>
        )}
      </div>
      <div>
        <form
          className="flex gap-2 border border-primary p-1 min-w-96"
          onSubmit={handleSubmit}
        >
          <input
            name="content"
            type="text"
            className="flex-grow"
            required
            disabled={isLoading}
          />
          <button
            className="px-2 bg-primary text-white disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat

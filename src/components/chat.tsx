import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from '../schema'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { randID } from '../rand'
import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useChatScroll } from '../hooks/use-chat-scroll'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [messages] = useQuery(
    z.query.message.where('chatID', '=', chatID).orderBy('timestamp', 'desc')
  )

  console.log(messages)

  const { bottomRef } = useChatScroll({
    containerRef,
    isLoading,
  })

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

    if (!content?.trim() || isLoading) return

    setIsLoading(true)
    const userMessageId = randID()
    upsertMessage(userMessageId, content, 'user')
    ;(e.target as HTMLFormElement).reset()
    inputRef.current?.focus()

    try {
      const messageHistory = messages
        .slice()
        .reverse()
        .map((msg) => ({ role: msg.role, content: msg.content }))

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messageHistory, { role: 'user', content }],
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
    <div className="flex flex-col h-full">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pt-8 bg-red-200"
      >
        <div className="max-w-2xl mx-auto">
          {messages.length ? (
            messages
              .slice()
              .reverse()
              .map((message) => (
                <div key={message.id} className="flex justify-end mb-2 gap-4">
                  <div
                    className={`max-w-prose px-2 py-2 flex flex-col gap-2 ${
                      message.role === 'assistant'
                        ? 'bg-gray-100 self-start w-full mr-8'
                        : 'bg-white self-end opacity-80 ml-8'
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))
          ) : (
            <span className="px-4">Empty thread</span>
          )}
          <div ref={bottomRef} className="h-px w-full" />
        </div>
      </div>
      <div className="bottom-0 left-0 right-0 border-t px-4 py-4 bg-gray-100">
        <form
          className="flex gap-2 px-1.5 max-w-3xl w-full mx-auto"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            name="content"
            type="text"
            placeholder={
              messages.length > 0 ? 'Reply...' : 'Start a new thread'
            }
            className="flex-grow rounded-none border-primary"
            required
            disabled={isLoading}
            autoFocus
          />
          <Button
            className="bg-primary text-white disabled:opacity-50 rounded-none"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Chat

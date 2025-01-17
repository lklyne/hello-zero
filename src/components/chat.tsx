import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from '../schema'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { randID } from '../rand'
import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts'
import { ShortcutMap } from '../types/keyboard'
import { PanelLeft, TrashIcon } from 'lucide-react'
import { useUpdateChatTitle } from '../hooks/use-update-chat-title'
import { ChatSettings } from './chat-settings'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  chatID: string
  timestamp: number
}

const Chat = ({
  chatID,
  toggleSidebar,
  onChatCreated,
}: {
  chatID?: string
  toggleSidebar: () => void
  onChatCreated: (newChatId: string) => void
}) => {
  const z = useZero<Schema>()
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>()
  const containerRef = useRef<HTMLDivElement>(null)

  const [messages] = useQuery(
    chatID
      ? z.query.message
          .where('chatID', '=', chatID)
          .orderBy('timestamp', 'desc')
      : z.query.message.where('chatID', '=', 'non-existent-id')
  )

  const [chats] = useQuery(
    chatID
      ? z.query.chat.where('id', '=', chatID)
      : z.query.chat.where('id', '=', 'non-existent-id')
  )
  const chat = chats?.[0]

  console.log(messages)

  const { bottomRef } = useChatScroll({
    containerRef,
    isLoading,
  })

  const { generateTitle } = useUpdateChatTitle()

  const upsertMessage = (
    messageID: string,
    content: string,
    chatID: string,
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

    const currentChatId = chatID ?? randID()
    if (!chatID) {
      z.mutate.chat.insert({
        id: currentChatId,
        userID: z.userID,
        title: 'New Chat',
        systemPrompt: 'You are a helpful assistant',
        temperature: 0.7,
        createdAt: Date.now(),
      })
      onChatCreated(currentChatId)
    }

    const userMessageId = randID()
    upsertMessage(userMessageId, content, currentChatId, 'user')
    ;(e.target as HTMLFormElement).reset()
    inputRef.current?.focus()

    try {
      const messageHistory = messages
        .slice()
        .reverse()
        .map((msg) => ({ role: msg.role, content: msg.content }))

      if (messages.length === 0) {
        const newTitle = await generateTitle([{ role: 'user', content }])
        z.mutate.chat.update({ id: currentChatId, title: newTitle })
      }

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
        upsertMessage(
          assistantMessageId,
          assistantMessage,
          currentChatId,
          'assistant'
        )
      }
    } catch (error) {
      console.error('Error calling Claude:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const unfocusInput = () => {
    inputRef.current?.blur()
  }

  const shortcuts: ShortcutMap = {
    focusInput: {
      key: '/',
      cmd: true,
      description: 'Focus input',
      action: focusInput,
    },
    unfocusInput: {
      key: 'Escape',
      description: 'Unfocus input',
      action: unfocusInput,
    },
  }

  useKeyboardShortcuts(shortcuts, true)

  return (
    <div className="flex flex-col h-full">
      <nav className="flex border-t border-b border-r border-primary justify-between items-center p-2 bg-primary-foreground">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeft className="w-5 h-5" />
          </Button>
          <h1 className="text font-bold">{chat?.title ?? 'Untitled'}</h1>
        </div>
        <ChatSettings chatID={chatID} />
      </nav>
      <div ref={containerRef} className="flex-1 overflow-y-auto pt-8">
        <div className="mx-auto px-12">
          {messages
            .slice()
            .reverse()
            .map((message) => (
              <div key={message.id} className="flex justify-end mb-2 gap-4">
                <div
                  className={`px-2 py-2 flex flex-col gap-2 ${
                    message.role === 'assistant'
                      ? 'bg-gray-100 self-start w-full mr-8'
                      : 'bg-white self-end opacity-80 ml-8'
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          <div ref={bottomRef} className="h-px w-full" />
        </div>
      </div>
      <div className="bottom-0 left-0 right-0 border px-2 py-2 bg-primary-foreground border-t-primary">
        <form
          className="flex gap-2 px-1 w-full mx-auto"
          onSubmit={handleSubmit}
        >
          <Input
            ref={inputRef}
            name="content"
            type="text"
            placeholder={
              messages.length > 0 ? 'Reply...' : 'Start a new thread'
            }
            className="flex-grow rounded-none text-sm"
            required
            disabled={isLoading}
            autoFocus
          />
          <Button
            className="rounded-none"
            type="submit"
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Send' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Chat

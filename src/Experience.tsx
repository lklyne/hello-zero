import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from './schema'
// import { randID } from './rand'
// import { Button } from '@/components/ui/button'
import Cookies from 'js-cookie'
import Chat from './components/chat'
import { useState } from 'react'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { ShortcutMap } from './types/keyboard'

const Experience = () => {
  const z = useZero<Schema>()
  const [chats] = useQuery(z.query.chat.where('userID', '=', z.userID))
  // const [users] = useQuery(z.query.user)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  // const currentUser = users.find((user) => user.id === z.userID)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleLogin = async () => {
    if (z.userID === 'anon') {
      await fetch('/api/login')
    } else {
      Cookies.remove('jwt')
    }
    location.reload()
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const deleteChat = (id: string | null) => {
    if (id) {
      z.mutate.chat.delete({ id })
    }
  }

  const handleNext = () => {
    const currentIndex = chats.findIndex((chat) => chat.id === selectedChatId)
    const nextIndex = (currentIndex + 1) % chats.length
    setSelectedChatId(chats[nextIndex]?.id ?? null)
  }

  const handlePrevious = () => {
    const currentIndex = chats.findIndex((chat) => chat.id === selectedChatId)
    const prevIndex = currentIndex <= 0 ? chats.length - 1 : currentIndex - 1
    setSelectedChatId(chats[prevIndex]?.id ?? null)
  }

  const shortcuts: ShortcutMap = {
    nextChat: {
      key: 'k',
      description: 'Next chat',
      action: handleNext,
    },
    previousChat: {
      key: 'j',
      description: 'Previous chat',
      action: handlePrevious,
    },
    toggleSidebar: {
      key: 'b',
      description: 'Toggle sidebar',
      action: toggleSidebar,
    },
    deleteChat: {
      key: 'Delete',
      description: 'Delete chat',
      action: () => deleteChat(selectedChatId),
    },
    createChat: {
      key: 'n',
      description: 'Create a new chat',
      action: () => setSelectedChatId(null),
    },
  }

  useKeyboardShortcuts(shortcuts)

  console.log(chats)

  const handleChatCreated = (newChatId: string) => {
    setSelectedChatId(newChatId)
  }

  return (
    <div className="w-full min-h-screen flex font-mono text-sm">
      <aside
        className={`w-80 min-h-screen bg-gray-200 border border-primary ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex flex-col">
              <div
                className={`flex justify-between px-2 py-4 cursor-pointer border-b border-primary ${
                  selectedChatId === null
                    ? ' text-black border-primary bg-primary-foreground border-b'
                    : 'hover:bg-gray-100 border-primary'
                }`}
                onClick={() => setSelectedChatId(null)}
              >
                <span className="uppercase tracking-widest">New thread</span>
                <kbd className="px-1 bg-primary-100 rounded">n</kbd>
              </div>
              {chats.map((chat) => (
                <div
                  className={`flex justify-between p-2 border-b border-t -mt-[1px] border-transparent cursor-pointer ${
                    selectedChatId === chat.id
                      ? 'border-b-primary border-t-primary bg-white'
                      : 'hover:bg-gray-100 hover:border-primary'
                  }`}
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  {chat.title}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    className="py-0 my-0 h-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                    }}
                  >
                    Delete
                  </Button> */}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={toggleLogin}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-300"
          >
            {z.userID === 'anon' ? 'Login' : 'Logout'}
          </button>
        </div>
      </aside>
      <main className="w-full h-screen bg-gray-100">
        <Chat
          toggleSidebar={toggleSidebar}
          chatID={selectedChatId ?? undefined}
          onChatCreated={handleChatCreated}
        />
      </main>
    </div>
  )
}

export default Experience

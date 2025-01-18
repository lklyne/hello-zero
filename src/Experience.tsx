import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from './schema'
import Cookies from 'js-cookie'
import Chat from './components/chat'
import { useState, useRef } from 'react'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { ShortcutMap } from './types/keyboard'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './components/ui/resizable'
import type { ImperativePanelHandle } from 'react-resizable-panels'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from './components/ui/popover'
import { Button } from './components/ui/button'
import { ArrowBigUpDash } from 'lucide-react'

const Experience = () => {
  const z = useZero<Schema>()
  const [chats] = useQuery(z.query.chat.where('userID', '=', z.userID))
  const [users] = useQuery(z.query.user)
  const currentUser = users.find((user) => user.id === z.userID)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null)

  const toggleLogin = async () => {
    if (z.userID === 'anon') {
      await fetch('/api/login')
    } else {
      Cookies.remove('jwt')
    }
    location.reload()
  }

  const toggleSidebar = () => {
    if (sidebarPanelRef.current?.isCollapsed()) {
      sidebarPanelRef.current?.expand()
    } else {
      sidebarPanelRef.current?.collapse()
    }
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
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={sidebarPanelRef}
          defaultSize={24}
          collapsible
          minSize={20}
          maxSize={40}
        >
          <aside
            className={`min-h-screen bg-gray-200 border border-primary flex flex-col`}
          >
            <div className="flex flex-col flex-grow">
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
                    <span className="uppercase tracking-widest">
                      New thread
                    </span>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex py-1 px-2 border-t border-primary gap-2">
              <div className="flex w-full gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      className="flex items-center w-full my-1 rounded-none border-primary"
                    >
                      {currentUser?.name}
                      <ArrowBigUpDash className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 mr-2">
                    <Button
                      variant="secondary"
                      className="w-full mt-8"
                      onClick={toggleLogin}
                    >
                      Logout
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </aside>
        </ResizablePanel>
        <ResizableHandle className="w-0" />
        <ResizablePanel defaultSize={76}>
          <main className="w-full h-screen bg-gray-100">
            <Chat
              toggleSidebar={toggleSidebar}
              chatID={selectedChatId ?? undefined}
              onChatCreated={handleChatCreated}
            />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default Experience

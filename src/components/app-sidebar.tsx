import * as React from 'react'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'

interface Chat {
  id: string
  title: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: Chat[]
  selectedChatId: string | null
  onChatSelect: (id: string | null) => void
  onLogout: () => void
  userId: string
}

export const AppSidebar = ({
  chats,
  selectedChatId,
  onChatSelect,
  onLogout,
  userId,
  ...props
}: AppSidebarProps) => {
  return (
    <Sidebar
      className="min-h-screen bg-gray-200 border border-primary"
      {...props}
    >
      <SidebarContent>
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex flex-col">
              <div
                className={`flex justify-between px-2 py-4 cursor-pointer border-b border-primary ${
                  selectedChatId === null
                    ? 'text-black border-primary bg-primary-foreground border-b'
                    : 'hover:bg-gray-100 border-primary'
                }`}
                onClick={() => onChatSelect(null)}
              >
                <span className="uppercase tracking-widest">New thread</span>
                <kbd className="px-1 bg-primary-100 rounded">n</kbd>
              </div>

              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex justify-between p-2 border-b border-t -mt-[1px] border-transparent cursor-pointer ${
                    selectedChatId === chat.id
                      ? 'border-b-primary border-t-primary bg-white'
                      : 'hover:bg-gray-100 hover:border-primary'
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  {chat.title}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-300"
          >
            {userId === 'anon' ? 'Login' : 'Logout'}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

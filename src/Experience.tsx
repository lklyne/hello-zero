import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from './schema'
import { randID } from './rand'
import { Button } from '@/components/ui/button'
import Cookies from 'js-cookie'
import Chat from './components/chat'

const Experience = () => {
  const z = useZero<Schema>()
  const [chats] = useQuery(z.query.chat.where('userID', '=', z.userID))
  const [users] = useQuery(z.query.user)
  const currentUser = users.find((user) => user.id === z.userID)

  const toggleLogin = async () => {
    if (z.userID === 'anon') {
      await fetch('/api/login')
    } else {
      Cookies.remove('jwt')
    }
    location.reload()
  }

  const createChat = () => {
    z.mutate.chat.insert({
      id: randID(),
      userID: z.userID, // Use the logged-in user's ID
      title: 'New Chat',
      systemPrompt: 'You are a helpful assistant',
      temperature: 0.7,
      createdAt: Date.now(),
    })
    console.log('chat created')
  }

  const deleteChat = (id: string) => {
    z.mutate.chat.delete({ id })
  }

  console.log(chats)

  return (
    <div className="w-full min-h-screen flex font-mono text-sm">
      <aside className="w-1/4 min-h-screen bg-gray-200 p-4">
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex justify-between pb-4">
              <h1>Chats {currentUser ? `(${currentUser.name})` : '(anon)'}</h1>
              <button onClick={() => createChat()}>Add</button>
            </div>
            <div className="flex flex-col gap-1">
              {chats.map((chat) => (
                <div className="flex justify-between" key={chat.id}>
                  {chat.title}{' '}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="py-0 my-0 h-6"
                    onClick={() => deleteChat(chat.id)}
                  >
                    Delete
                  </Button>
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
      <main className="w-3/4 min-h-screen bg-gray-100 p-4">
        {chats.length > 0 && <Chat chatID={chats[0].id} />}
      </main>
    </div>
  )
}

export default Experience

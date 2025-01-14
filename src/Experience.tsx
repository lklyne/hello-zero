import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from './schema'
import { randID } from './rand'
import { Button } from '@/components/ui/button'
import Cookies from 'js-cookie'

const Experience = () => {
  const z = useZero<Schema>()
  const [chats] = useQuery(z.query.chat)
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

  //   console.log(chats)

  return (
    <div className="w-full min-h-screen flex">
      <aside className="w-1/4 min-h-screen bg-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1>Chats {currentUser ? `(${currentUser.name})` : '(anon)'}</h1>
          <button
            onClick={toggleLogin}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-300"
          >
            {z.userID === 'anon' ? 'Login' : 'Logout'}
          </button>
        </div>
      </aside>
      <main className="w-3/4 min-h-screen bg-gray-100 p-4">
        {chats.length}
        <button onClick={() => createChat()}>Add</button>
      </main>
    </div>
  )
}

export default Experience

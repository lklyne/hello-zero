import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from './schema'

const Experience = () => {
  const z = useZero<Schema>()
  const [chats] = useQuery(z.query.chat)

  return (
    <div>
      {chats.length}
      <button
        onClick={() =>
          z.mutate.chat.insert({
            id: '1',
            userID: '1',
            messageID: '1',
            timestamp: Date.now(),
          })
        }
      >
        Add
      </button>
    </div>
  )
}

export default Experience

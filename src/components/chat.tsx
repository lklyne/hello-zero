import { useQuery, useZero } from '@rocicorp/zero/react'
import { Schema } from '../schema'
const Chat = ({ chatID }: { chatID: string }) => {
  const z = useZero<Schema>()

  const [messages] = useQuery(z.query.message.where('chatID', '=', chatID))

  return (
    <div>
      {messages.length ? (
        messages.map((message) => <div key={message.id}>{message.content}</div>)
      ) : (
        <span>No Messages</span>
      )}
    </div>
  )
}

export default Chat

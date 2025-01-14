// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  createTableSchema,
  definePermissions,
  Row,
  ANYONE_CAN,
} from '@rocicorp/zero'

const userSchema = createTableSchema({
  tableName: 'user',
  columns: {
    id: 'string',
    name: 'string',
    partner: 'boolean',
  },
  primaryKey: 'id',
})

const chatSchema = createTableSchema({
  tableName: 'chat',
  columns: {
    id: 'string',
    userID: 'string',
    title: 'string',
    systemPrompt: 'string',
    temperature: 'number',
    createdAt: 'number',
  },
  primaryKey: 'id',
  relationships: {
    user: {
      sourceField: 'userID',
      destSchema: userSchema,
      destField: 'id',
    },
  },
})

const messageSchema = createTableSchema({
  tableName: 'message',
  columns: {
    id: 'string',
    chatID: 'string',
    role: 'string', // 'user' | 'assistant' | 'system'
    content: 'string',
    timestamp: 'number',
  },
  primaryKey: 'id',
  relationships: {
    chat: {
      sourceField: 'chatID',
      destSchema: chatSchema,
      destField: 'id',
    },
  },
})

export const schema = createSchema({
  version: 1,
  tables: {
    user: userSchema,
    chat: chatSchema,
    message: messageSchema,
  },
})

export type Schema = typeof schema
export type User = Row<typeof userSchema>
export type Chat = Row<typeof chatSchema>
export type Message = Row<typeof messageSchema>

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => ({
  user: {
    row: {
      insert: ANYONE_CAN,
      update: { preMutation: ANYONE_CAN },
      delete: ANYONE_CAN,
    },
  },
  chat: {
    row: {
      insert: ANYONE_CAN,
      update: { preMutation: ANYONE_CAN },
      delete: ANYONE_CAN,
    },
  },
  message: {
    row: {
      insert: ANYONE_CAN,
      update: { preMutation: ANYONE_CAN },
      delete: ANYONE_CAN,
    },
  },
}))

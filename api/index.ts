import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { handle } from 'hono/vercel'
import { SignJWT } from 'jose'
import Anthropic from '@anthropic-ai/sdk'

export const config = {
  runtime: 'edge',
}

export const app = new Hono().basePath('/api')

// See seed.sql
// In real life you would of course authenticate the user however you like.
const userIDs = [
  '6z7dkeVLNm',
  'ycD76wW4R2',
  'IoQSaxeVO5',
  'WndZWmGkO4',
  'ENzoNm7g4E',
  'dLKecN3ntd',
  '7VoEoJWEwn',
  'enVvyDlBul',
  '9ogaDuDNFx',
]

function randomInt(max: number) {
  return Math.floor(Math.random() * max)
}

app.get('/login', async (c) => {
  const jwtPayload = {
    sub: userIDs[randomInt(userIDs.length)],
    iat: Math.floor(Date.now() / 1000),
  }

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30days')
    .sign(new TextEncoder().encode(must(process.env.ZERO_AUTH_SECRET)))

  setCookie(c, 'jwt', jwt, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  return c.text('ok')
})

app.post('/claude', async (c) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not defined')
    }

    const body = await c.req.json()
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const stream = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: body.messages,
      temperature: body.temperature,
      stream: true,
    })

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta') {
              controller.enqueue(chunk.delta.text)
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Claude API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500 }
    )
  }
})

app.post('/claude/title', async (c) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not defined')
    }

    const body = await c.req.json()
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      system:
        'Generate a very brief title (2-4 words) for this conversation. Respond with only the title, no explanation or punctuation.',
      messages: body.messages,
      temperature: 0.7,
      stream: false,
    })

    return c.text(response.content[0].text)
  } catch (error) {
    console.error('Claude API error:', error)
    return c.json({ error: 'Failed to generate title' }, 500)
  }
})

export default handle(app)

function must<T>(val: T) {
  if (!val) {
    throw new Error('Expected value to be defined')
  }
  return val
}

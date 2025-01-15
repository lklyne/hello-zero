import { getRequestListener } from '@hono/node-server'
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { app } from './api/index.js'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'development') {
  dotenv.config()
}

export default defineConfig({
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api')) {
            return next()
          }
          try {
            await getRequestListener(async (request) => {
              return await app.fetch(request, {})
            })(req, res)
          } catch (error) {
            console.error('API middleware error:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Serves the functions in /api during `npm run dev`, the way Vercel does once deployed.
const devApi = (mode: string): Plugin => ({
  name: 'dev-api',
  apply: 'serve',
  configureServer(server) {
    // Server-side settings (.env.local) reach the function the same way they do on Vercel
    for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ''))) {
      if (process.env[key] === undefined) process.env[key] = value
    }
    server.middlewares.use(async (req, res, next) => {
      // Exactly this address: the browser also loads /api/plan-trip.ts as a source file
      if ((req.url ?? '').split('?')[0] !== '/api/plan-trip') return next()
      try {
        const { default: handler } = await server.ssrLoadModule('/api/plan-trip.ts')
        await handler(req, res)
      } catch (err) {
        server.ssrFixStacktrace(err as Error)
        console.error(err)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'The planner ran into a problem. Please try again.' }))
      }
    })
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devApi(mode)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries and the bundled content change rarely, so they get their own
        // files and a new release of the app does not make visitors re-download them
        manualChunks(id) {
          const file = id.split('\\').join('/')
          const library = file.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)\//)?.[1] ?? ''
          // clsx is listed here because the charting library also uses it; left alone it would be
          // filed with the charts and drag them into every page
          if (['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler', 'clsx', 'tailwind-merge'].includes(library)) return 'react'
          if (library.startsWith('@supabase/')) return 'supabase'
          if (library === 'recharts' || library.startsWith('d3-') || library === 'victory-vendor') return 'charts'
          if (file.includes('/src/data/')) return 'content'
        },
      },
    },
  },
}))

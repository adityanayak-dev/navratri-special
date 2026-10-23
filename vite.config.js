import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PlayGarba lives (unmodified) in /public/garba. Static hosts serve /garba/ → /garba/index.html
// by themselves; this just makes the Vite dev + preview servers do the same instead of
// answering with the React app.
const garbaFolderIndex = () => {
  const rewrite = (req, _res, next) => {
    const url = req.url || ''
    const [path, query] = url.split('?')
    if (path.startsWith('/garba/') && path.endsWith('/')) req.url = `${path}index.html${query ? `?${query}` : ''}`
    next()
  }
  return { name: 'garba-folder-index', configureServer(s) { s.middlewares.use(rewrite) }, configurePreviewServer(s) { s.middlewares.use(rewrite) } }
}

export default defineConfig({
  plugins: [react(), garbaFolderIndex()],
  // in `npm run dev`, forward API calls to the Node server (npm run dev:server, needs DATABASE_URL)
  server: { proxy: { '/api': 'http://localhost:3000' } },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Vite plugin to mock API endpoints and serve data directory during development
function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      // Serve data/posters directory - handle both /data and /hrefs/watchbox/data
      const serveDataFiles = (req: any, res: any, next: any) => {
        try {
          let requestPath = req.url || ''
          
          // Remove base path if present
          if (requestPath.startsWith('/hrefs/watchbox/data')) {
            requestPath = requestPath.replace('/hrefs/watchbox/data', '/data')
          }
          
          // Only handle /data requests
          if (!requestPath.startsWith('/data')) {
            return next()
          }
          
          // req.url will be like '/posters/13.jpg' (without '/data' prefix)
          // Strip query string (e.g., ?v=123456) before constructing file path
          const relativePath = requestPath.replace('/data', '').split('?')[0]
          const filePath = path.join(__dirname, 'data', relativePath)
          
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const contentType = ext === '.svg' ? 'image/svg+xml' : 
                               ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                               ext === '.png' ? 'image/png' : 'application/octet-stream'
            res.setHeader('Content-Type', contentType)
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Cache-Control', 'public, max-age=3600')
            const stream = fs.createReadStream(filePath)
            stream.on('error', (err) => {
              console.error('Error reading file:', filePath, err)
              res.statusCode = 500
              res.end('Error reading file')
            })
            stream.pipe(res)
            return
          }
          next()
        } catch (error) {
          console.error('Error in serveDataFiles middleware:', error)
          next()
        }
      }
      
      // Register middleware early (before other middleware)
      server.middlewares.use(serveDataFiles)
      
      // Mock API endpoints - handle both /api and /hrefs/watchbox/api
      const handleApi = (req: any, res: any, next: any) => {
        try {
          let requestPath = req.url || ''
          
          // Remove base path if present
          if (requestPath.startsWith('/hrefs/watchbox/api')) {
            requestPath = requestPath.replace('/hrefs/watchbox/api', '/api')
          }
          
          // Only handle /api requests
          if (!requestPath.startsWith('/api')) {
            return next()
          }
          
          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          
          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
          }
          
          // Parse the pathname - strip /api prefix to get just /list_users.php
          const urlPath = requestPath.replace('/api', '')
          const pathname = urlPath.split('?')[0] // Remove query string
          
          // List avatars
          if (pathname === '/list_avatars.php' && req.method === 'GET') {
            const avatarsDir = path.join(__dirname, 'data', 'avatars')
            if (!fs.existsSync(avatarsDir)) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([]))
              return
            }
            // Avatars to move to bottom in this order
            const bottomAvatars = ['avatar-28.svg', 'avatar-06.svg', 'avatar-14.svg', 'avatar-15.svg', 'avatar-16.svg', 'avatar-26.svg', 'avatar-32.svg']
            
            const files = fs.readdirSync(avatarsDir)
              .filter(f => f.toLowerCase().endsWith('.svg'))
            
            // Separate files into regular and bottom avatars
            const regularFiles = files.filter(f => !bottomAvatars.includes(f))
            const bottomFiles = bottomAvatars.filter(f => files.includes(f))
            
            // Sort regular files naturally
            regularFiles.sort((a, b) => {
              const numA = parseInt(a.match(/\d+/)?.[0] || '0')
              const numB = parseInt(b.match(/\d+/)?.[0] || '0')
              return numA - numB
            })
            
            // Combine: regular files first, then bottom avatars in specified order
            const sortedFiles = [...regularFiles, ...bottomFiles]
            
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(sortedFiles))
            return
          }
          
          // List streaming services
          if (pathname === '/list_streaming_services.php' && req.method === 'GET') {
            const streamingDir = path.join(__dirname, 'data', 'streaming')
            if (!fs.existsSync(streamingDir)) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify([]))
              return
            }
            const files = fs.readdirSync(streamingDir)
              .filter(f => f.toLowerCase().endsWith('.svg'))
              .sort()
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(files))
            return
          }
          
          // List users
          if (pathname === '/list_users.php' && req.method === 'GET') {
          const usersDir = path.join(__dirname, 'data', 'users')
          if (!fs.existsSync(usersDir)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify([]))
            return
          }
          const files = fs.readdirSync(usersDir).filter(f => f.endsWith('.json'))
          const users = files.map(file => {
            try {
              const content = fs.readFileSync(path.join(usersDir, file), 'utf-8')
              const user = JSON.parse(content)
              // Support both old (avatar_poster_id) and new (avatar_filename) format
              const avatarFilename = user.avatar_filename || 
                (user.avatar_poster_id ? `avatar-${user.avatar_poster_id}.svg` : 'avatar-1.svg')
              return {
                user_id: user.user_id,
                name: user.name,
                avatar_filename: avatarFilename
              }
            } catch (e) {
              return null
            }
          }).filter(u => u !== null)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(users))
          return
        }
        
        // Get user
        if (pathname === '/get_user.php' && req.method === 'GET') {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          const userId = url.searchParams.get('user_id')
          if (userId) {
            const userFile = path.join(__dirname, 'data', 'users', `${userId}.json`)
            if (fs.existsSync(userFile)) {
              const content = fs.readFileSync(userFile, 'utf-8')
              const user = JSON.parse(content)
              // Support backward compatibility: convert avatar_poster_id to avatar_filename if needed
              if (!user.avatar_filename && user.avatar_poster_id) {
                user.avatar_filename = `avatar-${user.avatar_poster_id}.svg`
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(user))
              return
            }
          }
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'User not found' }))
          return
        }
        
        // Create user
        if (pathname === '/create_user.php' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const userId = data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
              let finalUserId = userId
              let counter = 1
              const usersDir = path.join(__dirname, 'data', 'users')
              if (!fs.existsSync(usersDir)) {
                fs.mkdirSync(usersDir, { recursive: true })
              }
              while (fs.existsSync(path.join(usersDir, `${finalUserId}.json`))) {
                finalUserId = `${userId}_${counter}`
                counter++
              }
              const user = {
                user_id: finalUserId,
                name: data.name,
                avatar_filename: data.avatar_filename,
                updated_at: new Date().toISOString(),
                items: []
              }
              const userFile = path.join(usersDir, `${finalUserId}.json`)
              fs.writeFileSync(userFile, JSON.stringify(user, null, 2))
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(user))
            } catch (e) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid request' }))
            }
          })
          return
        }
        
        // Save user
        if (pathname === '/save_user.php' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const userFile = path.join(__dirname, 'data', 'users', `${data.user_id}.json`)
              const user = {
                ...data,
                updated_at: new Date().toISOString()
              }
              fs.writeFileSync(userFile, JSON.stringify(user, null, 2))
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (e) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid request' }))
            }
          })
          return
        }
        
        // Delete user
        if (pathname === '/delete_user.php' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const userFile = path.join(__dirname, 'data', 'users', `${data.user_id}.json`)
              if (fs.existsSync(userFile)) {
                fs.unlinkSync(userFile)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              } else {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'User not found' }))
              }
            } catch (e) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid request' }))
            }
          })
          return
        }
        
        next()
        } catch (error) {
          console.error('Error in API middleware:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      }
      
      // Register API middleware
      server.middlewares.use(handleApi)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), mockApiPlugin()],
  base: mode === 'production' ? '/hrefs/watchbox/' : '/',
  server: {
    port: 8000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}))

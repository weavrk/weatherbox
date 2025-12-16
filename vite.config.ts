import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import https from 'https'

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
          
          // Skip Vite internal requests
          if (requestPath.startsWith('/@') || requestPath.startsWith('/node_modules/') || requestPath.startsWith('/src/')) {
            return next()
          }
          
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
        
        // Get content timestamp
        if (pathname === '/get_content_timestamp.php' && req.method === 'GET') {
          const moviesJson = path.join(__dirname, 'data', 'streaming-movies-results.json')
          const showsJson = path.join(__dirname, 'data', 'streaming-shows-results.json')
          
          const timestamps: number[] = []
          
          if (fs.existsSync(moviesJson)) {
            const stats = fs.statSync(moviesJson)
            timestamps.push(Math.floor(stats.mtime.getTime() / 1000)) // Convert to Unix timestamp
          }
          
          if (fs.existsSync(showsJson)) {
            const stats = fs.statSync(showsJson)
            timestamps.push(Math.floor(stats.mtime.getTime() / 1000)) // Convert to Unix timestamp
          }
          
          if (timestamps.length > 0) {
            const latestTimestamp = Math.max(...timestamps)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ timestamp: latestTimestamp }))
            return
          } else {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Content files not found' }))
            return
          }
        }

        // Get default streaming services (dev mock - avoid PHP dependency)
        if (pathname === '/get_default_streaming_services.php' && req.method === 'GET') {
          try {
            const servicesFile = path.join(__dirname, 'data', 'default_streaming_services.json')
            if (!fs.existsSync(servicesFile)) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Default services file not found' }))
              return
            }

            const content = fs.readFileSync(servicesFile, 'utf-8')
            const services = JSON.parse(content)

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(services))
          } catch (error) {
            console.error('Error loading default streaming services in dev:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to load default streaming services' }))
          }
          return
        }

        // Handle get_person_filmography.php - call TMDB API directly from Node.js
        if (pathname === '/get_person_filmography.php' && req.method === 'GET') {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          const personId = url.searchParams.get('person_id')
          
          if (!personId) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ success: false, error: 'Person ID is required' }))
            return
          }
          
          // TMDB API configuration (from PHP file)
          const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NGEzNjhkMDJlN2Y2NTI0MmU2M2YxMGFhMTMwZTkxZiIsIm5iZiI6MTY1Nzg0MDg4OS44NTY5OTk5LCJzdWIiOiI2MmQwYTRmOTYyZmNkMzAwNTU0NWFjZWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TxRfKQMNiojwSNluc8kpo0SxCev8mwIC_RDQXmvjRAg'
          const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
          
          // Fetch person details with combined credits using Node.js https
          const tmdbUrl = `${TMDB_BASE_URL}/person/${personId}?language=en-US&append_to_response=combined_credits`
          const urlObj = new URL(tmdbUrl)
          
          const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
          
          const tmdbReq = https.request(options, (tmdbRes) => {
            let data = ''
            
            // Handle non-200 responses
            if (tmdbRes.statusCode && tmdbRes.statusCode !== 200) {
              res.statusCode = tmdbRes.statusCode
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ success: false, error: `TMDB API returned ${tmdbRes.statusCode}` }))
              return
            }
            
            tmdbRes.on('data', (chunk) => {
              data += chunk
            })
            
            tmdbRes.on('end', () => {
              try {
                const personDetails = JSON.parse(data)
                
                if (personDetails.status_code) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.setHeader('Access-Control-Allow-Origin', '*')
                  res.end(JSON.stringify({ success: false, error: personDetails.status_message || 'API error' }))
                  return
                }
                
                // Extract filmography
                const combinedCredits: any[] = []
                
                if (personDetails.combined_credits?.cast && Array.isArray(personDetails.combined_credits.cast)) {
                  for (const credit of personDetails.combined_credits.cast) {
                    if (!credit.title && !credit.name) continue
                    
                    const isMovie = !!credit.title
                    const title = isMovie ? credit.title : (credit.name || 'Unknown')
                    
                    combinedCredits.push({
                      id: credit.id || 0,
                      title: title,
                      poster_path: credit.poster_path || null,
                      release_date: credit.release_date || null,
                      first_air_date: credit.first_air_date || null,
                      isMovie: isMovie,
                      popularity: credit.popularity || 0
                    })
                  }
                }
                
                // Sort by popularity
                combinedCredits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                
                // Limit to top 50
                const filmography = combinedCredits.slice(0, 50)
                
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(JSON.stringify({
                  success: true,
                  filmography: filmography,
                  debug: {
                    person_id: personId,
                    filmography_count: filmography.length,
                    has_combined_credits: !!personDetails.combined_credits,
                    cast_count: personDetails.combined_credits?.cast?.length || 0
                  }
                }))
              } catch (parseErr) {
                console.error('Error parsing TMDB response:', parseErr)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(JSON.stringify({ success: false, error: 'Failed to parse API response' }))
              }
            })
          })
          
          tmdbReq.on('error', (err) => {
            console.error('Error fetching person filmography:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ success: false, error: 'Failed to fetch filmography', details: err.message }))
          })
          
          tmdbReq.end()
          return
        }
        
        // Execute PHP files using PHP CLI (only for /api/*.php requests that aren't handled above)
        if (pathname.startsWith('/') && pathname.endsWith('.php') && !pathname.startsWith('/@')) {
          const phpFile = path.join(__dirname, 'api', path.basename(pathname))
          
          if (!fs.existsSync(phpFile)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'PHP file not found' }))
            return
          }
          
          // Get query string from original URL
          const fullUrl = req.url || ''
          const queryString = fullUrl.includes('?') ? fullUrl.split('?')[1] : ''
          
          // Set up environment for PHP
          const env = { ...process.env }
          env.REQUEST_METHOD = req.method || 'GET'
          env.QUERY_STRING = queryString
          env.SCRIPT_NAME = `/api${pathname}`
          env.PATH_INFO = ''
          env.SERVER_NAME = 'localhost'
          env.SERVER_PORT = '8000'
          env.HTTP_HOST = 'localhost:8000'
          
          // Execute PHP file
          const php = spawn('php', ['-f', phpFile], { env })
          
          let output = ''
          let errorOutput = ''
          
          php.stdout.on('data', (data: Buffer) => {
            output += data.toString()
          })
          
          php.stderr.on('data', (data: Buffer) => {
            errorOutput += data.toString()
          })
          
          php.on('close', (code: number) => {
            if (code !== 0) {
              console.error('PHP execution error:', errorOutput)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'PHP execution failed', details: errorOutput }))
              return
            }
            
            // PHP output might have headers, extract JSON (look for first { or [)
            const jsonStart = output.search(/[\{\[]/)
            if (jsonStart !== -1) {
              const jsonContent = output.substring(jsonStart)
              // Try to find the end of JSON (last matching } or ])
              let braceCount = 0
              let bracketCount = 0
              let jsonEnd = jsonStart
              for (let i = jsonStart; i < output.length; i++) {
                if (output[i] === '{') braceCount++
                if (output[i] === '}') braceCount--
                if (output[i] === '[') bracketCount++
                if (output[i] === ']') bracketCount--
                if (braceCount === 0 && bracketCount === 0 && i > jsonStart) {
                  jsonEnd = i + 1
                  break
                }
              }
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(output.substring(jsonStart, jsonEnd))
            } else {
              // If no JSON found, send raw output
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(output.trim())
            }
          })
          
          php.on('error', (err: Error) => {
            console.error('PHP spawn error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to execute PHP. Make sure PHP is installed and in PATH.', details: err.message }))
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

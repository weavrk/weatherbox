# Chat Notes - Key Information

## Important Configuration

### Hosting Path
- **Live URL**: `https://www.weavrk.com/hrefs/watchbox`
- **Base Path**: `/hrefs/watchbox/` (configured in `vite.config.ts`)

### Development Setup
- **Local URL**: `http://localhost:5173`
- **Mock API**: Vite plugin in `vite.config.ts` handles API calls during development
- **No PHP needed locally**: All API endpoints are mocked using JSON files

## Key Files Modified

1. **vite.config.ts**
   - Base path set to `/hrefs/watchbox/`
   - Mock API plugin for development (reads/writes to `data/users/*.json`)
   - Serves `/data/posters/` directory for images

2. **All path references updated**:
   - `public/manifest.json` - start_url and icon paths
   - `public/service-worker.js` - BASE_PATH
   - `src/services/api.ts` - SERVICE_ICONS paths
   - `src/main.tsx` - service worker registration
   - `index.html` - manifest and icon links
   - `.htaccess` - rewrite rules

3. **Poster URL function** (`src/services/api.ts`):
   - Uses `.svg` placeholders in development
   - Uses `.jpg` in production

## Development Features

### Mock API Endpoints
All API calls are intercepted by Vite plugin:
- `/api/list_users.php` - Reads from `data/users/*.json`
- `/api/get_user.php` - Reads specific user JSON
- `/api/create_user.php` - Creates new user JSON file
- `/api/save_user.php` - Updates user JSON file

### Placeholder Posters
- Created 12 SVG placeholders (1.svg through 12.svg)
- Located in `data/posters/`
- Script: `create-placeholder-posters.js`

## Folder Structure

```
watchbox/
├── src/              # React app
├── api/              # PHP endpoints (for production)
├── public/            # Static assets
├── data/              # JSON storage + posters
└── dist/              # Build output (after npm run build)
```

## Quick Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (with mock API)
npm run build            # Build for production
```

## Deployment Notes

When deploying to `https://www.weavrk.com/hrefs/watchbox`:
1. Upload `dist/` contents → `/public_html/hrefs/watchbox/`
2. Upload `api/` → `/public_html/api/`
3. Upload `data/` → `/public_html/data/`
4. Set permissions: `data/users/` and `data/posters/` to 755

## Current Status

✅ All paths updated to `/hrefs/watchbox/`
✅ Mock API working for development
✅ Placeholder posters created
✅ Folder renamed from `watchbox` to `watchbox`
✅ Ready for development and deployment

## Next Steps

1. Continue development locally (mock API handles everything)
2. Create real app icons (192×192 and 512×512 PNG)
3. Add real poster images (JPG format)
4. Build and deploy when ready

---

*All important information is saved in code files. This is just a quick reference.*


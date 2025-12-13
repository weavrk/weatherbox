# WatchBox

A Progressive Web App (PWA) for tracking your favorite movies and TV shows across multiple streaming services.

## Features

- 📱 **PWA** - Works offline, installable on iOS and Android
- 👥 **Multi-Profile** - Separate watchlists for each household member
- 📺 **Two Lists** - "Top List" for favorites and "Watchlist" for content to watch
- 🎨 **Streaming Service Icons** - See at a glance where content is available
- 📱 **Responsive** - Optimized for mobile phones, tablets, and kiosks
- 💾 **No Database** - Uses flat JSON files for simple hosting

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **CSS** for styling (no framework dependencies)
- **Service Worker** for offline support

### Backend
- **PHP 7+** for API endpoints
- **JSON files** for data storage
- **No framework required** - simple PHP scripts

## Project Structure

```
watchbox/
├── src/                      # React source code
│   ├── components/           # React components
│   ├── contexts/             # React context (UserContext)
│   ├── services/             # API service layer
│   ├── types/                # TypeScript type definitions
│   └── styles/               # CSS styles
├── public/                   # Static assets
│   ├── assets/services/      # Streaming service icons
│   ├── manifest.json         # PWA manifest
│   └── service-worker.js     # Service worker for offline
├── api/                      # PHP API endpoints
│   ├── list_users.php
│   ├── get_user.php
│   ├── create_user.php
│   └── save_user.php
├── data/                     # JSON data storage
│   ├── users/                # User profiles
│   └── posters/              # Poster images
└── dist/                     # Built files (after npm run build)
```

## Development

### Prerequisites

- Node.js 18+ and npm
- PHP 7+ (for local API testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will run on `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory ready for deployment.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

### Quick Deploy

**Auto-deploy with GitHub** (recommended):
```bash
git add -A
git commit -m "Your changes"
git push
# GitHub Actions automatically deploys!
```

**Manual deploy**:
```bash
npm run deploy
```

### Live Site
- Production: https://weavrk.com/hrefs/watchbox/
- GitHub: https://github.com/weavrk/watchbox

## Usage

### Profile Management

1. **Landing Screen** - Select or create a profile
2. **Create Profile** - Choose a name and avatar (from poster library)
3. **Switch Profiles** - Click avatar in top-right → "Switch account"

### Managing Content

- **Add Items** - Click the "+" button next to WatchBox title (currently placeholder)
- **Move Items** - Click ⋮ menu on any title card → "Move to..."
- **Delete Items** - Click ⋮ menu → "Delete"

### Adding Posters

1. Get poster images (ideally from TMDB)
2. Name them `<poster_id>.jpg` (where poster_id matches tmdb_id)
3. Upload to `/public_html/data/posters/`
4. Reference the poster_id in your user JSON items

## Data Structure

### User JSON (`/data/users/<user_id>.json`)

```json
{
  "user_id": "katherine",
  "name": "Katherine",
  "avatar_poster_id": 12345,
  "updated_at": "2025-11-21T00:00:00Z",
  "items": [
    {
      "id": "unique-item-id",
      "title": "Show Title",
      "tmdb_id": 12345,
      "poster_id": 12345,
      "listType": "top",
      "services": ["netflix", "hulu"]
    }
  ]
}
```

### Supported Streaming Services

- `netflix` - Netflix
- `hulu` - Hulu
- `appletv` - Apple TV+
- `max` - Max (formerly HBO Max)
- `disneyplus` - Disney+
- `amazon` - Amazon Prime Video
- `peacock` - Peacock

## Browser Support

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ iOS Safari (PWA install supported)
- ✅ Android Chrome (PWA install supported)

## Future Enhancements

- TMDB API integration for searching and adding content
- Automatic poster downloads
- Shared lists between users
- Ratings and notes
- Watch history tracking
- Recommendations based on viewing preferences

## License

MIT License - Feel free to use and modify for your needs.



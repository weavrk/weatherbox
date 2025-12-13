# WatchBox Build Plan

> **Last Updated**: December 2024  
> The definitive reference for understanding how WatchBox is built, how it works, and how to develop it.

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Architecture Patterns](#2-architecture-patterns)
3. [Development Workflow](#3-development-workflow)
4. [Design System](#4-design-system)
5. [File Structure & Conventions](#5-file-structure--conventions)
6. [Deployment Pipeline](#6-deployment-pipeline)
7. [Key Features & How They Work](#7-key-features--how-they-work)
8. [Extending the App](#8-extending-the-app)

---

## 1. Tech Stack Overview

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework with functional components and hooks |
| **TypeScript** | 5.2.2 | Type safety, better IDE support, self-documenting code |
| **Vite** | 5.0.8 | Lightning-fast dev server, optimized builds, HMR |
| **Lucide React** | 0.555.0 | Icon library (minimal bundle size, tree-shakeable) |

### Backend

| Technology | Purpose |
|------------|---------|
| **PHP 7+** | Simple REST API endpoints (no framework) |
| **JSON files** | Flat-file data storage (no database required) |
| **Apache** | Web server with `.htaccess` for routing/caching |

### PWA

| Feature | Implementation |
|---------|---------------|
| **Service Worker** | `public/service-worker.js` - offline caching |
| **Web Manifest** | `public/manifest.json` - installable app |
| **Icons** | 192x192 and 512x512 PNG for home screen |

### Why These Choices?

- **No database** → Simple deployment, easy backups (just copy JSON files)
- **Vite over CRA** → 10x faster dev startup, smaller builds
- **TypeScript** → Catches bugs early, better refactoring
- **PHP** → Works on any shared hosting (GoDaddy, etc.)
- **Flat CSS** → No framework bloat, full control, CSS variables for theming

---

## 2. Architecture Patterns

### Component Structure

```
src/
├── components/          # UI components
│   ├── ProfileSelectionScreen.tsx   # Container (has state/logic)
│   ├── MainWatchBoxScreen.tsx       # Container (has state/logic)
│   ├── Header.tsx                   # Presentational
│   ├── TitleCard.tsx                # Presentational
│   ├── SectionList.tsx              # Presentational
│   └── ...
├── contexts/            # Global state (React Context)
│   ├── UserContext.tsx              # Current user state
│   └── DesignSystemContext.tsx      # Theme customization
├── services/            # API layer
│   └── api.ts                       # All backend calls
├── types/               # TypeScript definitions
│   └── index.ts
└── styles/              # CSS
    ├── index.css                    # Main styles
    └── design-system.css            # Design panel styles
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              DesignSystemProvider                    │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │               UserProvider                     │  │    │
│  │  │  ┌─────────────────────────────────────────┐  │  │    │
│  │  │  │            AppContent                    │  │  │    │
│  │  │  │                                          │  │  │    │
│  │  │  │   currentUser ? MainScreen : Profiles    │  │  │    │
│  │  │  └─────────────────────────────────────────┘  │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Context API Usage

**UserContext** (`src/contexts/UserContext.tsx`)
- Stores `currentUser` (User object or null)
- Provides `loadUser(userId)`, `setCurrentUser()`, `logout()`
- Persists last-used user ID in `localStorage`

**DesignSystemContext** (`src/contexts/DesignSystemContext.tsx`)
- Stores color tokens (accent, primary, secondary, etc.)
- Provides `updateTokens()`, `applyTokens()`
- Persists theme to `localStorage`
- Applies to DOM via CSS custom properties

### Service Layer Pattern

All API calls go through `src/services/api.ts`:

```typescript
// Example: Creating a user
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await fetch(`${API_BASE}/create_user.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
}
```

**Benefits:**
- Single source of truth for API calls
- Easy to mock for testing
- Type-safe request/response
- Centralized error handling

---

## 3. Development Workflow

### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# Dev server runs at http://localhost:5173
```

### Mock API System

Vite plugin in `vite.config.ts` intercepts API calls during development:

```typescript
// Mocked endpoints:
/api/list_users.php     → Reads from data/users/*.json
/api/get_user.php       → Reads specific user JSON
/api/create_user.php    → Creates new user JSON file
/api/save_user.php      → Updates user JSON file
/api/delete_user.php    → Deletes user JSON file
/api/list_avatars.php   → Lists data/avatars/*.svg files
```

**No PHP required locally!** The Vite plugin:
- Reads/writes JSON files directly
- Serves images from `data/` directory
- Handles both `/api/` and `/hrefs/watchbox/api/` paths

### Hot Module Replacement

Vite provides instant updates:
- Component changes → immediate refresh
- CSS changes → injected without reload
- Context changes → state preserved when possible

### Build Process

```bash
npm run build
```

This runs:
1. `tsc` - TypeScript compilation (type checking)
2. `vite build` - Bundle and optimize

Output in `dist/`:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Main bundle
│   └── index-[hash].css   # Compiled styles
└── ...
```

---

## 4. Design System

### CSS Custom Properties

All theme values in `src/styles/index.css`:

```css
:root {
  /* Background */
  --bg-primary: #141414;
  --bg-secondary: #1a1a1a;
  --bg-card: #2a2a2a;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  
  /* Accent (customizable via Design Panel) */
  --accent: #e91e63;
  --accent-hover: #f06292;
  --accent-secondary: #00bcd4;
  
  /* Spacing */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border */
  --border-radius: 8px;
}
```

### Live Theme Customization

The Design System Panel (`src/components/DesignSystemPanel.tsx`) allows real-time color changes:

1. User clicks the small circle button (bottom-left corner)
2. Panel opens with color pickers
3. Changes update `pendingTokens` state
4. "Apply Changes" saves to:
   - React state (immediate)
   - CSS custom properties (DOM)
   - localStorage (persistence)

### Typography Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.page-header` | 2rem | 700 | Main page titles |
| `.section-header` | 1.5rem | 600 | Section titles |
| `.section-subheader` | 1.25rem | 500 | Secondary headings |
| `.content-header` | 1.125rem | 600 | Card headers |
| `.label` | 0.875rem | 500 | Form labels |
| `.body-copy` | 1rem | 400 | Body text |

### Responsive Breakpoints

```css
/* Mobile first (default styles) */

/* Tablet: 480px+ */
@media (min-width: 480px) {
  /* 3-column grids, larger avatars */
}

/* Desktop: 1280px+ */
@media (min-width: 1280px) {
  /* 4-5 column grids, max-width containers */
}
```

### Neumorphic Button Style

Buttons use layered shadows for depth:

```css
.create-button-full {
  box-shadow: 
    4px 4px 12px rgba(0, 0, 0, 0.5),      /* Bottom-right shadow */
    -4px -4px 12px rgba(255, 255, 255, 0.08), /* Top-left highlight */
    inset 0 -2px 4px rgba(0, 0, 0, 0.4),   /* Inner shadow */
    inset 0 2px 4px rgba(255, 255, 255, 0.1); /* Inner highlight */
}
```

---

## 5. File Structure & Conventions

### Directory Organization

```
watchbox/
├── src/                      # React source code
│   ├── components/           # React components (PascalCase)
│   ├── contexts/             # React contexts (PascalCase)
│   ├── services/             # API/utility functions (camelCase)
│   ├── types/                # TypeScript types
│   ├── styles/               # CSS files
│   ├── utils/                # Helper functions
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
├── public/                   # Static assets (copied to dist)
│   ├── assets/services/      # Streaming service icons
│   ├── manifest.json         # PWA manifest
│   └── service-worker.js     # Offline support
├── api/                      # PHP API endpoints
├── data/                     # JSON storage + images
│   ├── users/                # User JSON files
│   ├── avatars/              # Avatar SVG files
│   ├── posters/              # Movie poster images
│   └── streaming/            # Streaming service icons
└── dist/                     # Build output (gitignored)
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TitleCard.tsx` |
| Hooks/Contexts | PascalCase | `UserContext.tsx` |
| Services | camelCase | `api.ts` |
| CSS classes | kebab-case | `.title-card` |
| CSS variables | kebab-case | `--bg-primary` |
| TypeScript types | PascalCase | `WatchBoxItem` |
| JSON files | kebab-case | `user-id.json` |

### Import Patterns

```typescript
// External imports first
import React, { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';

// Internal imports by category
import { useUser } from '../contexts/UserContext';
import { saveUser, getUser } from '../services/api';
import type { WatchBoxItem } from '../types';
```

---

## 6. Deployment Pipeline

### Build for Production

```bash
npm run build
```

### Upload Structure

Target: `https://www.weavrk.com/hrefs/watchbox/`

```
/public_html/
├── hrefs/
│   └── watchbox/
│       ├── index.html          # From dist/
│       ├── assets/             # From dist/assets/
│       └── service-worker.js   # From public/
├── api/                        # PHP endpoints
│   ├── create_user.php
│   ├── delete_user.php
│   ├── get_user.php
│   ├── list_users.php
│   ├── save_user.php
│   └── list_avatars.php
└── data/                       # Data storage
    ├── users/                  # User JSON files
    ├── avatars/                # Avatar SVGs
    ├── posters/                # Movie posters
    └── streaming/              # Service icons
```

### Path Configuration

Base path set in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/hrefs/watchbox/',
  // ...
})
```

All asset paths (manifest, service worker, API calls) account for this base.

### Permission Settings

```bash
# Directories that need write access
chmod 755 /data/users/
```

### Deployment Checklist

1. ✅ Run `npm run build`
2. ✅ Upload `dist/` contents → `/public_html/hrefs/watchbox/`
3. ✅ Upload `api/` → `/public_html/api/`
4. ✅ Upload `data/` → `/public_html/data/`
5. ✅ Set permissions on `data/users/` (755)
6. ✅ Test all API endpoints
7. ✅ Test PWA install

---

## 7. Key Features & How They Work

### Profile Management Flow

```
ProfileSelectionScreen
        │
        ├── List existing profiles
        │   └── Click profile → loadUser(userId) → MainWatchBoxScreen
        │
        ├── Add Profile (+)
        │   └── CreateProfilePage
        │       ├── Enter name
        │       ├── Select avatar
        │       ├── Select streaming services
        │       └── Create → createUser() API → loadUser()
        │
        └── Edit Profile (pencil icon)
            └── EditProfileModal
                ├── Change name/avatar/services
                ├── Save → saveUser() API
                └── Delete → deleteUser() API → back to ProfileSelection
```

### List Management (Queue/Watchlist)

**Data Structure** (`WatchBoxItem`):
```typescript
interface WatchBoxItem {
  id: string;           // Unique ID
  title: string;        // Display title
  tmdb_id: number;      // TMDB identifier
  poster_filename: string;
  listType: 'top' | 'watch';  // Which list
  services: string[];         // Streaming services
}
```

**Operations:**
- **Move**: Change `listType` between 'top' and 'watch'
- **Delete**: Remove from `items` array
- All changes → `saveUser()` API call

### Poster Image System

```typescript
// In api.ts
export function getPosterUrl(posterFilename: string | number): string {
  if (typeof posterFilename === 'number') {
    // Legacy: numeric poster_id
    return `/data/posters/${posterId}.jpg`;
  }
  // New: filename string
  return `/data/posters/${posterFilename}`;
}
```

Posters stored in `data/posters/` as JPG files, named by TMDB ID.

### Streaming Service Icons

Dynamic loading from `data/streaming/`:

```typescript
// List available services
const services = await getAvailableStreamingServices();
// Returns: ['netflix.svg', 'hulu.svg', ...]

// Get icon URL
const iconUrl = getServiceIcon('netflix.svg');
// Returns: '/data/streaming/netflix.svg'
```

### Design System Customization

1. **Open Panel**: Click circle button (bottom-left)
2. **Edit Colors**: Use color pickers or type hex values
3. **Live Preview**: Colors apply immediately via `updateTokens()`
4. **Save**: Click "Apply Changes" → persists to localStorage

```typescript
// Applied to DOM
root.style.setProperty('--accent', tokens.accent);
root.style.setProperty('--text-primary', tokens.primary);
// etc.
```

---

## 8. Extending the App

### Adding a New Component

1. Create file: `src/components/MyComponent.tsx`
2. Use TypeScript with props interface:

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Do Something</button>
    </div>
  );
}
```

3. Add styles in `src/styles/index.css`:

```css
.my-component {
  padding: var(--spacing-md);
  background-color: var(--bg-card);
  border-radius: var(--border-radius);
}
```

4. Import and use in parent component.

### Adding API Endpoints

**PHP endpoint** (`api/my_endpoint.php`):

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// Your logic here
$result = ['success' => true, 'data' => 'example'];
echo json_encode($result);
```

**Vite mock** (add to `vite.config.ts` in `handleApi` function):

```typescript
if (pathname === '/my_endpoint.php' && req.method === 'GET') {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true, data: 'example' }));
  return;
}
```

**Service function** (`src/services/api.ts`):

```typescript
export async function myEndpoint(): Promise<{ success: boolean; data: string }> {
  const response = await fetch(`${API_BASE}/my_endpoint.php`);
  if (!response.ok) throw new Error('Failed');
  return response.json();
}
```

### Adding Streaming Services

1. Add SVG icon to `data/streaming/` (e.g., `newservice.svg`)
2. That's it! The API dynamically lists available services.

### Modifying Styles

**Adding a new CSS variable:**

```css
/* In :root */
:root {
  --my-new-color: #ff6b6b;
}

/* Usage */
.my-element {
  color: var(--my-new-color);
}
```

**Making it customizable via Design Panel:**

1. Add to `DesignTokens` interface in `DesignSystemContext.tsx`
2. Add to `defaultTokens` object
3. Add to `applyTokensToDOM()` function
4. Add color picker in `DesignSystemPanel.tsx`

---

## Quick Reference

### Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config + mock API |
| `src/App.tsx` | App structure + providers |
| `src/contexts/UserContext.tsx` | User state management |
| `src/services/api.ts` | All API functions |
| `src/types/index.ts` | TypeScript definitions |
| `src/styles/index.css` | Main styles + CSS vars |

### Data Files

| Path | Content |
|------|---------|
| `data/users/*.json` | User profiles |
| `data/avatars/*.svg` | Profile avatars |
| `data/posters/*.jpg` | Movie posters |
| `data/streaming/*.svg` | Service icons |

---

*This document reflects the current state of WatchBox. Update as the project evolves.*


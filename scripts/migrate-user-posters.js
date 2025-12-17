#!/usr/bin/env node

/**
 * Migrate user JSON files: replace poster_filename with poster_path from TMDB
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const USERS_DIR = path.join(__dirname, '..', 'data', 'users');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchPosterPath(tmdbId, isMovie) {
  const endpoint = isMovie ? 'movie' : 'tv';
  const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`;
  
  try {
    const data = await httpsGet(url);
    return data.poster_path || null;
  } catch (error) {
    console.error(`  ✗ Failed to fetch ${tmdbId}:`, error.message);
    return null;
  }
}

async function migrateUserFile(filePath) {
  console.log(`\nMigrating ${path.basename(filePath)}...`);
  
  const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changeCount = 0;
  
  for (const item of userData.items) {
    // Skip if already has poster_path
    if (item.poster_path) {
      continue;
    }
    
    // If has old poster_filename but no poster_path
    if (item.poster_filename && item.tmdb_id) {
      console.log(`  [${item.title}] Fetching poster_path...`);
      
      // Fetch poster_path from TMDB
      const posterPath = await fetchPosterPath(item.tmdb_id, item.isMovie);
      
      if (posterPath) {
        item.poster_path = posterPath;
        console.log(`    ✓ Got: ${posterPath}`);
      } else {
        item.poster_path = null;
        console.log(`    ⚠ No poster available`);
      }
      
      // Remove old fields
      delete item.poster_filename;
      delete item.poster_id;
      
      changeCount++;
      
      // Rate limit: wait 250ms between requests
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2), 'utf8');
    console.log(`✓ Saved ${changeCount} changes to ${path.basename(filePath)}`);
  } else {
    console.log(`✓ No changes needed for ${path.basename(filePath)}`);
  }
  
  return changeCount;
}

async function main() {
  console.log('Starting user poster migration...\n');
  
  const userFiles = fs.readdirSync(USERS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(USERS_DIR, f));
  
  let totalChanges = 0;
  
  for (const filePath of userFiles) {
    const changes = await migrateUserFile(filePath);
    totalChanges += changes;
  }
  
  console.log(`\n✅ Migration complete! Updated ${totalChanges} items across ${userFiles.length} users.`);
}

main().catch(console.error);


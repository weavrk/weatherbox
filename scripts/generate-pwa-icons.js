#!/usr/bin/env node
/**
 * Generate PWA icons (icon-192.png and icon-512.png) from logo SVG
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const logoPath = path.join(ROOT_DIR, 'public', 'logo.svg');
const icon192Path = path.join(ROOT_DIR, 'public', 'icon-192.png');
const icon512Path = path.join(ROOT_DIR, 'public', 'icon-512.png');

async function generateIcons() {
  try {
    if (!fs.existsSync(logoPath)) {
      console.error(`❌ Logo not found: ${logoPath}`);
      process.exit(1);
    }

    console.log('🎨 Generating PWA icons from logo...');
    
    // Generate icon-192.png (192x192 PNG with white background)
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .png()
      .toFile(icon192Path);

    console.log(`✅ Created: ${icon192Path}`);

    // Generate icon-512.png (512x512 PNG with white background)
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .png()
      .toFile(icon512Path);

    console.log(`✅ Created: ${icon512Path}`);
    console.log('\n✨ PWA icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();


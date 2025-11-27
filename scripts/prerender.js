/**
 * Simple Prerendering Script for SEO
 * Generates static HTML files for key routes
 * 
 * Usage: node scripts/prerender.js
 * 
 * Prerequisites: npm install --save-dev puppeteer
 * 
 * This script uses Puppeteer to render React app and save HTML
 * for better SEO and faster initial load
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.PRERENDER_URL || 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '../dist/prerendered');

// Routes to prerender
const ROUTES = [
  '/',
  '/blog',
  '/gear',
  '/about',
  '/contact',
  '/references',
];

async function prerender() {
  console.log('🚀 Starting prerendering...');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      console.log(`📄 Prerendering: ${route}`);
      
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to route
      const url = `${BASE_URL}${route}`;
      await page.goto(url, {
        waitUntil: 'networkidle0', // Wait until network is idle
        timeout: 30000,
      });
      
      // Wait for React to hydrate (optional - if you have loading indicators)
      await page.waitForTimeout(1000);
      
      // Get rendered HTML
      const html = await page.content();
      
      // Save HTML
      const filename = route === '/' ? 'index.html' : `${route.replace(/\//g, '_')}.html`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      fs.writeFileSync(filepath, html, 'utf-8');
      console.log(`✅ Saved: ${filepath}`);
      
      await page.close();
    }
    
    console.log('✅ Prerendering complete!');
  } catch (error) {
    console.error('❌ Prerendering error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run prerender
prerender().catch(console.error);


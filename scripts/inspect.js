import sharp from 'sharp';
import fs from 'fs';

async function inspect() {
  const metadata = await sharp('WhatsApp Image 2026-08-30 at 12.20.46.jpeg').metadata();
  console.log('Metadata:', metadata);
  
  // Let's create a directory for cropped assets
  if (!fs.existsSync('public/services')) {
    fs.mkdirSync('public/services', { recursive: true });
  }

  // Let's also check if there are sub-cards in a grid or layout
  // We can sample various coordinates or crop a grid of cards
}

inspect();

import sharp from 'sharp';
import fs from 'fs';

async function analyze() {
  const image = sharp('WhatsApp Image 2026-08-30 at 12.20.46.jpeg');
  const { width, height } = await image.metadata();
  console.log(`Image size: ${width}x${height}`);

  // Let's get raw pixel buffer to analyze rows and columns or brightness / edges
  const { data, info } = await sharp('WhatsApp Image 2026-08-30 at 12.20.46.jpeg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Buffer length: ${data.length}, channels: ${info.channels}`);

  // Let's analyze grid lines or bounding boxes
  // Let's also create 2x2, 3x3, 4x3, or 2x3 crops to see what is on this poster/banner/card collection
  // Let's save a lower-res ascii or color map or detect blocks
}

analyze();

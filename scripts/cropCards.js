import sharp from 'sharp';
import fs from 'fs';

const imagePath = 'WhatsApp Image 2026-08-30 at 12.20.46.jpeg';

async function cropCards() {
  const meta = await sharp(imagePath).metadata();
  const width = meta.width;   // 1536
  const height = meta.height; // 1024

  console.log(`Image size: ${width}x${height}`);

  if (!fs.existsSync('public/services')) {
    fs.mkdirSync('public/services', { recursive: true });
  }

  // Define normalized [ymin, xmin, ymax, xmax] in 0-1000 scale
  // Row 1 (top): Aadhar, PAN, Voter ID
  // Row 2 (middle): Driving License, Ayushman, ABHA
  // Row 3 (bottom): E-Shram, Ration Card, PVC Employee, Custom Any Card
  const cards = [
    {
      id: 'aadhaar_card',
      file: 'public/services/aadhaar.jpeg',
      box: [0, 0, 336, 332],
    },
    {
      id: 'pan_card',
      file: 'public/services/pan.jpeg',
      box: [0, 333, 336, 666],
    },
    {
      id: 'voter_id',
      file: 'public/services/voter.jpeg',
      box: [0, 667, 336, 1000],
    },
    {
      id: 'driving_license',
      file: 'public/services/driving-license.jpeg',
      box: [336, 0, 670, 332],
    },
    {
      id: 'ayushman_card',
      file: 'public/services/ayushman.jpeg',
      box: [336, 333, 670, 666],
    },
    {
      id: 'abha_card',
      file: 'public/services/abha.jpeg',
      box: [336, 667, 670, 1000],
    },
    {
      id: 'e_shram',
      file: 'public/services/eshram.jpeg',
      box: [670, 0, 1000, 250],
    },
    {
      id: 'ration_card',
      file: 'public/services/ration.jpeg',
      box: [670, 250, 1000, 500],
    },
    {
      id: 'corporate_id',
      file: 'public/services/employee.jpeg',
      box: [670, 500, 1000, 750],
    },
    {
      id: 'custom_card',
      file: 'public/services/custom.jpeg',
      box: [670, 750, 1000, 1000],
    },
  ];

  for (const card of cards) {
    const [ymin, xmin, ymax, xmax] = card.box;
    const top = Math.round((ymin / 1000) * height);
    const left = Math.round((xmin / 1000) * width);
    const cropWidth = Math.round(((xmax - xmin) / 1000) * width);
    const cropHeight = Math.round(((ymax - ymin) / 1000) * height);

    console.log(`Extracting ${card.id}: left=${left}, top=${top}, w=${cropWidth}, h=${cropHeight}`);

    await sharp(imagePath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .jpeg({ quality: 95 })
      .toFile(card.file);
  }

  console.log('All cards cropped successfully!');
}

cropCards().catch(console.error);

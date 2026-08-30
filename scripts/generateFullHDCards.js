import sharp from 'sharp';
import fs from 'fs';

const imagePath = 'WhatsApp Image 2026-08-30 at 12.20.46.jpeg';

async function generateFullHDCards() {
  const meta = await sharp(imagePath).metadata();
  const width = meta.width;   // 1536
  const height = meta.height; // 1024

  console.log(`Original size: ${width}x${height}`);

  const outDir = 'public/services/cards';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Precise coordinates of each card
  const cards = [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      // Row 1, Col 1
      box: [60, 12, 330, 322],
    },
    {
      id: 'pan',
      name: 'PAN Card',
      // Row 1, Col 2
      box: [60, 342, 330, 655],
    },
    {
      id: 'voter',
      name: 'Voter ID Card',
      // Row 1, Col 3
      box: [60, 676, 330, 988],
    },
    {
      id: 'driving-license',
      name: 'Driving License',
      // Row 2, Col 1
      box: [405, 12, 660, 322],
    },
    {
      id: 'ayushman',
      name: 'Ayushman Card',
      // Row 2, Col 2
      box: [405, 342, 660, 655],
    },
    {
      id: 'abha',
      name: 'ABHA Card',
      // Row 2, Col 3
      box: [405, 676, 660, 988],
    },
    {
      id: 'eshram',
      name: 'E-Shram Card',
      // Row 3, Col 1
      box: [728, 12, 966, 248],
    },
    {
      id: 'ration',
      name: 'Ration Card',
      // Row 3, Col 2
      box: [728, 262, 966, 490],
    },
    {
      id: 'employee',
      name: 'PVC Employee Card',
      // Row 3, Col 3
      box: [736, 502, 966, 730],
    },
    {
      id: 'custom',
      name: 'Custom Any Card',
      // Row 3, Col 4
      box: [736, 752, 966, 980],
    },
  ];

  for (const item of cards) {
    const [ymin, xmin, ymax, xmax] = item.box;
    const top = Math.max(0, Math.round((ymin / 1000) * height));
    const left = Math.max(0, Math.round((xmin / 1000) * width));
    const cropWidth = Math.min(width - left, Math.round(((xmax - xmin) / 1000) * width));
    const cropHeight = Math.min(height - top, Math.round((ymax / 1000) * height) - top);

    console.log(`Processing ${item.name}: ${cropWidth}x${cropHeight} from (${left}, ${top})`);

    // Target Full HD width: 1720px (standard crisp 86:54 ratio: 1720 x 1080)
    const targetW = 1720;
    const targetH = 1080;

    // Step 1: Extract, upscale with Lanczos3, sharpen aggressively for micro-text & crisp vector-like edges
    const enhancedBuffer = await sharp(imagePath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(targetW, targetH, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill',
        withoutEnlargement: false,
      })
      // Enhance contrast and remove color haze
      .modulate({
        brightness: 1.03,
        saturation: 1.15,
      })
      // Unsharp mask: sharp edges, crisp text, crystal clear definition
      .sharpen({
        sigma: 1.8,
        m1: 1.6,
        m2: 0.8,
        x1: 2,
        y2: 10,
        y3: 20,
      })
      // Linear color stretch / normalize
      .normalize()
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();

    // Create a pristine white card frame with rounded corners (CR80 standard)
    const cardRadius = 42; // standard CR80 corner radius on 1720x1080
    const roundedCornersSvg = Buffer.from(`
      <svg width="${targetW}" height="${targetH}">
        <rect x="0" y="0" width="${targetW}" height="${targetH}" rx="${cardRadius}" ry="${cardRadius}" fill="#fff"/>
      </svg>
    `);

    // Save PNG with crisp rounded card outline and optional white background
    const finalCardPng = await sharp(enhancedBuffer)
      .composite([
        {
          input: roundedCornersSvg,
          blend: 'dest-in',
        },
      ])
      .png({ quality: 100 })
      .toFile(`${outDir}/${item.id}.png`);

    // Also write standard public/services/${item.id}.jpeg with pure white background
    await sharp({
      create: {
        width: targetW + 80,
        height: targetH + 80,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: enhancedBuffer,
          top: 40,
          left: 40,
        },
      ])
      .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
      .toFile(`public/services/${item.id}.jpeg`);

    console.log(`Saved Full HD ${item.id}.png and ${item.id}.jpeg`);
  }

  console.log('All Full HD card pictures generated with crystal clarity and white background!');
}

generateFullHDCards().catch(console.error);

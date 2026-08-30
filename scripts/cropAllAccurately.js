import sharp from 'sharp';
import fs from 'fs';

const imagePath = 'WhatsApp Image 2026-08-30 at 12.20.46.jpeg';

async function cropAllAccurately() {
  const meta = await sharp(imagePath).metadata();
  const width = meta.width;
  const height = meta.height;

  const outDirs = ['public/services', 'public/services/cards', 'public/services/cells'];
  for (const dir of outDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Exact card bounds
  const cards = [
    {
      id: 'aadhaar',
      templateId: 'aadhaar_front_back',
      cardBox: [58, 10, 330, 323],
      cellBox: [0, 0, 336, 332],
    },
    {
      id: 'pan',
      templateId: 'pan_card',
      cardBox: [58, 340, 330, 657],
      cellBox: [0, 333, 336, 666],
    },
    {
      id: 'voter',
      templateId: 'voter_id',
      cardBox: [58, 674, 330, 990],
      cellBox: [0, 667, 336, 1000],
    },
    {
      id: 'driving-license',
      templateId: 'driving_license',
      cardBox: [404, 10, 662, 323],
      cellBox: [336, 0, 670, 332],
    },
    {
      id: 'ayushman',
      templateId: 'pmjay_ayushman',
      cardBox: [404, 340, 662, 657],
      cellBox: [336, 333, 670, 666],
    },
    {
      id: 'abha',
      templateId: 'abha_card',
      cardBox: [404, 674, 662, 990],
      cellBox: [336, 667, 670, 1000],
    },
    {
      id: 'eshram',
      templateId: 'e_shram',
      cardBox: [725, 10, 968, 250],
      cellBox: [670, 0, 1000, 250],
    },
    {
      id: 'ration',
      templateId: 'ration_card',
      cardBox: [725, 260, 968, 492],
      cellBox: [670, 250, 1000, 500],
    },
    {
      id: 'employee',
      templateId: 'corporate_id',
      cardBox: [735, 500, 968, 732],
      cellBox: [670, 500, 1000, 750],
    },
    {
      id: 'custom',
      templateId: 'custom_card',
      cardBox: [735, 750, 968, 982],
      cellBox: [670, 750, 1000, 1000],
    },
  ];

  for (const item of cards) {
    // 1. Crop exact card
    const [cymin, cxmin, cymax, cxmax] = item.cardBox;
    const cTop = Math.max(0, Math.round((cymin / 1000) * height));
    const cLeft = Math.max(0, Math.round((cxmin / 1000) * width));
    const cW = Math.min(width - cLeft, Math.round(((cxmax - cxmin) / 1000) * width));
    const cH = Math.min(height - cTop, Math.round(((cymax - cymin) / 1000) * height));

    await sharp(imagePath)
      .extract({ left: cLeft, top: cTop, width: cW, height: cH })
      .png({ quality: 100 })
      .toFile(`public/services/cards/${item.id}.png`);

    await sharp(imagePath)
      .extract({ left: cLeft, top: cTop, width: cW, height: cH })
      .jpeg({ quality: 95 })
      .toFile(`public/services/${item.id}.jpeg`);

    // 2. Crop cell
    const [lymin, lxmin, lymax, lxmax] = item.cellBox;
    const lTop = Math.max(0, Math.round((lymin / 1000) * height));
    const lLeft = Math.max(0, Math.round((lxmin / 1000) * width));
    const lW = Math.min(width - lLeft, Math.round(((lxmax - lxmin) / 1000) * width));
    const lH = Math.min(height - lTop, Math.round(((lymax - lymin) / 1000) * height));

    await sharp(imagePath)
      .extract({ left: lLeft, top: lTop, width: lW, height: lH })
      .jpeg({ quality: 95 })
      .toFile(`public/services/cells/${item.id}_cell.jpeg`);
  }

  console.log('Finished accurately cropping all 10 cards and cells!');
}

cropAllAccurately().catch(console.error);

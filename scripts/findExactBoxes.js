import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import fs from 'fs';

const imagePath = 'WhatsApp Image 2026-08-30 at 12.20.46.jpeg';

async function findExactCardBoxes() {
  const ai = new GoogleGenAI({});
  const imgData = fs.readFileSync(imagePath).toString('base64');

  const prompt = `Look at the image with 10 cards arranged in 3 rows.
For each of the 10 cards:
1. Aadhaar Card (Row 1 Col 1)
2. PAN Card (Row 1 Col 2)
3. Voter ID / EPIC (Row 1 Col 3)
4. Driving License (Row 2 Col 1)
5. Ayushman Bharat Card (Row 2 Col 2)
6. ABHA Card (Row 2 Col 3)
7. E-Shram Card (Row 3 Col 1)
8. Ration Card (Row 3 Col 2)
9. PVC Employee Card (Row 3 Col 3)
10. Custom Any Card (Row 3 Col 4)

Detect the exact inner rectangle of each card (excluding any outer surrounding borders, dark grid lines, or background space outside the card).
Return JSON with format:
[
  { "id": "aadhaar", "name": "Aadhaar Card", "box2d": [ymin, xmin, ymax, xmax] },
  ...
]
Coordinates normalized 0-1000.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imgData } },
          { text: prompt }
        ]
      }
    ]
  });

  console.log('Result:');
  console.log(response.text);
  fs.writeFileSync('scripts/detected_boxes.json', response.text);
}

findExactCardBoxes().catch(console.error);

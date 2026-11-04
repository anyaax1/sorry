import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read GEMINI_API_KEY from .env.local or environment
function getApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }
  const envPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

const apiKey = getApiKey();
if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY is not defined in .env.local or environment.');
  console.error('Please configure GEMINI_API_KEY in .env.local before running asset generation.');
  process.exit(1);
}

// 2. Initialize official Google GenAI SDK
const client = new GoogleGenAI({ apiKey });

// 3. Define asset catalog
const ASSETS_TO_GENERATE = [
  {
    category: 'desktop',
    filename: 'wallpaper.png',
    model: 'gemini-3-pro-image',
    prompt:
      'Windows 95 desktop wallpaper, soft classic teal #008080 gradient background, subtle nostalgic retro aesthetic, gentle clean composition with plenty of negative space on the left for desktop icons, warm natural ambient lighting, 16:9 ratio, no text.',
    dimensions: '1920x1080',
  },
  {
    category: 'icons',
    filename: 'sorry-hotline.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Square 1:1 icon of a realistic vintage 1990s red landline telephone on a wooden table, coiled cord, nostalgic warm lighting, photorealistic studio photography, clean central subject, no text.',
    dimensions: '512x512',
  },
  {
    category: 'icons',
    filename: 'court.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Square 1:1 icon of a rich polished wooden judge gavel and sound block with a brass band, dark mahogany, warm cinematic courtroom lighting, photorealistic studio photography, no text.',
    dimensions: '512x512',
  },
  {
    category: 'icons',
    filename: 'vending.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Square 1:1 icon of a retro vintage glass-front vending machine with soft glowing interior lights displaying candy and treat boxes, polished metal trim, photorealistic, no text.',
    dimensions: '512x512',
  },
  {
    category: 'icons',
    filename: 'boss-fight.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Square 1:1 icon of a puffed-up arcade ego boss creature with glowing purple energy and a pompous expression, high quality indie game character art, dramatic lighting, no text.',
    dimensions: '512x512',
  },
  {
    category: 'icons',
    filename: 'delivery.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Square 1:1 icon of a vintage 1990s green delivery courier scooter with a brown paper parcel tied with twine, warm morning lighting, photorealistic, no text.',
    dimensions: '512x512',
  },
  {
    category: 'hotline',
    filename: 'vintage-telephone.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Detailed realistic vintage 1990s red telephone receiver resting on wooden desk with curled cord, nostalgic warm interior atmosphere, studio photography.',
    dimensions: '800x600',
  },
  {
    category: 'court',
    filename: 'gavel.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Cinematic close-up of a dark wooden gavel on a sound block with gold brass trim on a court bench, shallow depth of field, dramatic courtroom lighting.',
    dimensions: '800x600',
  },
  {
    category: 'vending',
    filename: 'vending-machine.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Realistic retro illuminated vending machine stocked with colorful candy packages and gifts, 1990s nostalgic style, photorealistic.',
    dimensions: '800x800',
  },
  {
    category: 'boss-fight',
    filename: 'ego-boss.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Detailed character art of The Ego Boss: a large arrogant puffed-up creature with purple glowing aura and smug expression, high quality digital art.',
    dimensions: '800x800',
  },
  {
    category: 'delivery',
    filename: 'apology-parcel.png',
    model: 'gemini-3.1-flash-image',
    prompt:
      'Artisan gift parcel wrapped in brown kraft paper tied with rustic twine rope and a red wax heart seal, sitting on a wooden porch with fresh flowers, photorealistic.',
    dimensions: '800x800',
  },
];

const forceRegenerate = process.argv.includes('--force');
const baseOutDir = path.join(rootDir, 'public', 'assets', 'generated');
const manifestPath = path.join(baseOutDir, 'manifest.json');

let manifest = {
  generatedAt: new Date().toISOString(),
  assets: {},
};

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    console.warn('Could not read existing manifest:', err.message);
  }
}

async function run() {
  console.log(`Starting asset generation for ${ASSETS_TO_GENERATE.length} assets...`);
  console.log(`Force regeneration: ${forceRegenerate}`);

  for (const spec of ASSETS_TO_GENERATE) {
    const catDir = path.join(baseOutDir, spec.category);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    const outPath = path.join(catDir, spec.filename);
    const relativePath = `/assets/generated/${spec.category}/${spec.filename}`;

    if (fs.existsSync(outPath) && !forceRegenerate) {
      console.log(`[EXISTS] ${relativePath} already present. Skipping.`);
      manifest.assets[relativePath] = {
        category: spec.category,
        filename: spec.filename,
        model: spec.model,
        dimensions: spec.dimensions,
        format: path.extname(spec.filename).replace('.', ''),
        status: 'cached',
        path: relativePath,
      };
      continue;
    }

    console.log(`[GENERATING] ${relativePath} with model ${spec.model}...`);

    let imageBuffer = null;
    let status = 'failed';

    try {
      const response = await client.interactions.create({
        model: spec.model,
        input: spec.prompt,
      });

      // Extract image data from Interactions API response
      if (response && response.outputs) {
        for (const out of response.outputs) {
          if (out.type === 'image' && out.data) {
            imageBuffer = Buffer.from(out.data, 'base64');
            break;
          }
        }
      } else if (response && response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageBuffer = Buffer.from(part.inlineData.data, 'base64');
            break;
          }
        }
      }

      if (imageBuffer && imageBuffer.length > 0) {
        fs.writeFileSync(outPath, imageBuffer);
        console.log(`[SUCCESS] Saved ${relativePath} (${imageBuffer.length} bytes)`);
        status = 'generated';
      } else {
        console.warn(`[WARNING] No image data returned for ${relativePath}`);
      }
    } catch (err) {
      console.error(`[API ERROR] ${relativePath}:`, err.message || err);
      // Check if image exists in fallback/artifact directory
      status = `api_error: ${err.message || 'unknown'}`;
    }

    manifest.assets[relativePath] = {
      category: spec.category,
      filename: spec.filename,
      model: spec.model,
      dimensions: spec.dimensions,
      format: path.extname(spec.filename).replace('.', ''),
      status,
      path: relativePath,
    };
  }

  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest updated at ${manifestPath}`);
}

run();

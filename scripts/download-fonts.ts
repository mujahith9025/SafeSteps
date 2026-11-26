/**
 * Downloads Noto Sans, Noto Sans Tamil, and Noto Sans Devanagari TrueType fonts
 * into public/fonts/ for server-side PDF generation in SafeSteps.
 */

import fs from "fs";
import path from "path";

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

const FONT_SOURCES = [
  {
    name: "NotoSans-Regular.ttf",
    url: "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
  },
  {
    name: "NotoSans-Bold.ttf",
    url: "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf",
  },
  {
    name: "NotoSansTamil-Regular.ttf",
    url: "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf",
  },
  {
    name: "NotoSansTamil-Bold.ttf",
    url: "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Bold.ttf",
  },
  {
    name: "NotoSansDevanagari-Regular.ttf",
    url: "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf",
  },
  {
    name: "NotoSansDevanagari-Bold.ttf",
    url: "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf",
  },
];

async function downloadFonts() {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }

  for (const font of FONT_SOURCES) {
    const dest = path.join(FONTS_DIR, font.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`✓ ${font.name} already exists (${fs.statSync(dest).size} bytes)`);
      continue;
    }

    console.log(`Downloading ${font.name}...`);
    try {
      const res = await fetch(font.url);
      if (!res.ok) {
        console.warn(`Failed to download ${font.name}: ${res.statusText}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`✓ Downloaded ${font.name} (${buffer.length} bytes)`);
    } catch (err: any) {
      console.error(`Error downloading ${font.name}:`, err.message);
    }
  }
}

downloadFonts();

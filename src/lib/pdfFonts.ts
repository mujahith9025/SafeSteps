/**
 * SafeSteps PDF Typography & Unicode Font Engine
 *
 * Supports embedding Google Noto Sans, Noto Sans Tamil, and Noto Sans Devanagari
 * into PDFKit documents to ensure Tamil, Hindi, and Latin scripts render without mojibake.
 */

import path from "path";
import fs from "fs";

export interface RegisteredFonts {
  regular: string;
  bold: string;
  hasTamil: boolean;
  hasDevanagari: boolean;
  hasNoto: boolean;
}

/**
 * Registers TrueType fonts with the PDFKit document instance.
 */
export function setupPdfFonts(
  doc: typeof import("pdfkit").prototype,
  primaryLanguage: string = "en"
): RegisteredFonts {
  const fontsDir = path.join(process.cwd(), "public", "fonts");

  const notoReg = path.join(fontsDir, "NotoSans-Regular.ttf");
  const notoBold = path.join(fontsDir, "NotoSans-Bold.ttf");
  const tamilReg = path.join(fontsDir, "NotoSansTamil-Regular.ttf");
  const tamilBold = path.join(fontsDir, "NotoSansTamil-Bold.ttf");
  const devReg = path.join(fontsDir, "NotoSansDevanagari-Regular.ttf");
  const devBold = path.join(fontsDir, "NotoSansDevanagari-Bold.ttf");

  let hasNoto = false;
  let hasTamil = false;
  let hasDevanagari = false;

  try {
    if (fs.existsSync(notoReg) && fs.existsSync(notoBold)) {
      doc.registerFont("Noto-Regular", notoReg);
      doc.registerFont("Noto-Bold", notoBold);
      hasNoto = true;
    }
  } catch {
    // Graceful fallback to built-in fonts
  }

  try {
    if (fs.existsSync(tamilReg)) {
      doc.registerFont("Tamil-Regular", tamilReg);
      if (fs.existsSync(tamilBold)) {
        doc.registerFont("Tamil-Bold", tamilBold);
      } else {
        doc.registerFont("Tamil-Bold", tamilReg);
      }
      hasTamil = true;
    }
  } catch {
    // Graceful fallback
  }

  try {
    if (fs.existsSync(devReg)) {
      doc.registerFont("Devanagari-Regular", devReg);
      if (fs.existsSync(devBold)) {
        doc.registerFont("Devanagari-Bold", devBold);
      } else {
        doc.registerFont("Devanagari-Bold", devReg);
      }
      hasDevanagari = true;
    }
  } catch {
    // Graceful fallback
  }

  let regular = "Helvetica";
  let bold = "Helvetica-Bold";

  if (primaryLanguage === "ta" && hasTamil) {
    regular = "Tamil-Regular";
    bold = "Tamil-Bold";
  } else if (primaryLanguage === "hi" && hasDevanagari) {
    regular = "Devanagari-Regular";
    bold = "Devanagari-Bold";
  } else if (hasNoto) {
    regular = "Noto-Regular";
    bold = "Noto-Bold";
  }

  return {
    regular,
    bold,
    hasTamil,
    hasDevanagari,
    hasNoto,
  };
}

/**
 * Chooses the best font family based on detected Unicode character blocks in the text.
 */
export function getFontForText(
  text: string,
  fonts: RegisteredFonts,
  isBold: boolean = false
): string {
  if (!text) return isBold ? fonts.bold : fonts.regular;

  // Detect Tamil block (U+0B80 - U+0BFF)
  if (fonts.hasTamil && /[\u0B80-\u0BFF]/.test(text)) {
    return isBold ? "Tamil-Bold" : "Tamil-Regular";
  }

  // Detect Devanagari block (U+0900 - U+097F)
  if (fonts.hasDevanagari && /[\u0900-\u097F]/.test(text)) {
    return isBold ? "Devanagari-Bold" : "Devanagari-Regular";
  }

  return isBold ? fonts.bold : fonts.regular;
}

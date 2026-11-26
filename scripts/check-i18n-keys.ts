/**
 * SafeSteps i18n Key Parity Verification Script
 *
 * Recursively checks that messages/en.json, messages/ta.json, and messages/hi.json
 * share the exact same key hierarchy and leaf keys.
 */

import fs from 'fs';
import path from 'path';

function getLeafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getLeafKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function main() {
  const baseDir = process.cwd();
  const enPath = path.join(baseDir, 'messages', 'en.json');
  const taPath = path.join(baseDir, 'messages', 'ta.json');
  const hiPath = path.join(baseDir, 'messages', 'hi.json');

  if (!fs.existsSync(enPath) || !fs.existsSync(taPath) || !fs.existsSync(hiPath)) {
    console.error('❌ Error: One or more message files (en.json, ta.json, hi.json) do not exist.');
    process.exit(1);
  }

  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const ta = JSON.parse(fs.readFileSync(taPath, 'utf8'));
  const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

  const enKeys = getLeafKeys(en);
  const taKeys = getLeafKeys(ta);
  const hiKeys = getLeafKeys(hi);

  const enKeySet = new Set(enKeys);
  const taKeySet = new Set(taKeys);
  const hiKeySet = new Set(hiKeys);

  console.log(`\n======================================================`);
  console.log(` SafeSteps i18n Key Parity Check`);
  console.log(`======================================================`);
  console.log(`• English (en) leaf keys count: ${enKeys.length}`);
  console.log(`• Tamil   (ta) leaf keys count: ${taKeys.length}`);
  console.log(`• Hindi   (hi) leaf keys count: ${hiKeys.length}\n`);

  let hasError = false;

  // Check Tamil
  const missingInTa = enKeys.filter((k) => !taKeySet.has(k));
  const extraInTa = taKeys.filter((k) => !enKeySet.has(k));

  if (missingInTa.length > 0) {
    hasError = true;
    console.error(`❌ Keys in en.json missing from ta.json (${missingInTa.length}):`);
    missingInTa.forEach((k) => console.error(`   - ${k}`));
  }
  if (extraInTa.length > 0) {
    hasError = true;
    console.error(`❌ Extra keys in ta.json not found in en.json (${extraInTa.length}):`);
    extraInTa.forEach((k) => console.error(`   - ${k}`));
  }

  // Check Hindi
  const missingInHi = enKeys.filter((k) => !hiKeySet.has(k));
  const extraInHi = hiKeys.filter((k) => !enKeySet.has(k));

  if (missingInHi.length > 0) {
    hasError = true;
    console.error(`❌ Keys in en.json missing from hi.json (${missingInHi.length}):`);
    missingInHi.forEach((k) => console.error(`   - ${k}`));
  }
  if (extraInHi.length > 0) {
    hasError = true;
    console.error(`❌ Extra keys in hi.json not found in en.json (${extraInHi.length}):`);
    extraInHi.forEach((k) => console.error(`   - ${k}`));
  }

  if (hasError) {
    console.error(`\n❌ i18n key parity check FAILED. Please resolve missing/extra keys.`);
    process.exit(1);
  }

  console.log(`✅ SUCCESS: All 3 translation files (en, ta, hi) have exactly identical keys (${enKeys.length} keys)!\n`);
}

main();

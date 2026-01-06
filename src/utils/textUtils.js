/**
 * Amharic normalization utility to handle namesake characters that sound the same
 * but are written differently. This improves search UX by allowing users to find
 * hymns regardless of which spelling variant they use.
 * 
 * Namesake groups:
 * 1. ሀ (Hä), ሐ (Hä), ኀ (Hä) -> Normalize to ሀ
 * 2. ሰ (Sä), ሠ (Sä) -> Normalize to ሰ
 * 3. አ (Ä), ዐ (Ä) -> Normalize to አ
 * 4. ጸ (Ts'ä), ፀ (Ts'ä) -> Normalize to ጸ
 */

const AMHARIC_NORMALIZATION_MAP = {
  // ha-group (ሀ, ሐ, ኀ)
  'ሀ': 'ሀ', 'ሐ': 'ሀ', 'ኀ': 'ሀ',
  'ሁ': 'ሁ', 'ሑ': 'ሁ', 'ኁ': 'ሁ',
  'ሂ': 'ሂ', 'ሒ': 'ሂ', 'ኂ': 'ሂ',
  'ሃ': 'ሃ', 'ሓ': 'ሃ', 'ኃ': 'ሃ',
  'ሄ': 'ሄ', 'ሔ': 'ሄ', 'ኄ': 'ሄ',
  'ህ': 'ህ', 'ሕ': 'ህ', 'ኅ': 'ህ',
  'ሆ': 'ሆ', 'ሖ': 'ሆ', 'ኆ': 'ሆ',

  // se-group (ሰ, ሠ)
  'ሰ': 'ሰ', 'ሠ': 'ሰ',
  'ሱ': 'ሱ', 'ሡ': 'ሱ',
  'ሲ': 'ሲ', 'ሢ': 'ሲ',
  'ሳ': 'ሳ', 'ሣ': 'ሳ',
  'ሴ': 'ሴ', 'ሤ': 'ሴ',
  'ስ': 'ስ', 'ሥ': 'ስ',
  'ሶ': 'ሶ', 'ሦ': 'ሶ',

  // a-group (አ, ዐ)
  'አ': 'አ', 'ዐ': 'አ',
  'ኡ': 'ኡ', 'ዑ': 'ኡ',
  'ኢ': 'ኢ', 'ዒ': 'ኢ',
  'ኣ': 'ኣ', 'ዓ': 'ኣ',
  'ኤ': 'ኤ', 'ዔ': 'ኤ',
  'እ': 'እ', 'ዕ': 'እ',
  'ኦ': 'ኦ', 'ዖ': 'ኦ',

  // tse-group (ጸ, ፀ)
  'ጸ': 'ጸ', 'ፀ': 'ጸ',
  'ጹ': 'ጹ', 'ፁ': 'ጹ',
  'ጺ': 'ጺ', 'ፂ': 'ጺ',
  'ጻ': 'ጻ', 'ፃ': 'ጻ',
  'ጼ': 'ጼ', 'ፄ': 'ጼ',
  'ጽ': 'ጽ', 'ፅ': 'ጽ',
  'ጾ': 'ጾ', 'ፆ': 'ጾ',
};

/**
 * Normalizes Amharic text by collapsing namesake character variations 
 * into a single canonical form.
 * 
 * @param {string} text The text to normalize
 * @returns {string} Normalized text
 */
const normalizeAmharic = (text) => {
  if (!text) return '';
  return text
    .split('')
    .map(char => AMHARIC_NORMALIZATION_MAP[char] || char)
    .join('');
};

module.exports = {
  normalizeAmharic,
};

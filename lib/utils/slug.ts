/**
 * SEO-Friendly Slug Generation Utility
 * Handles English, Hindi (Devanagari), and other Unicode characters
 */

/**
 * Hindi (Devanagari) to English transliteration mapping
 * Common Hindi characters and their Romanized equivalents
 */
const HINDI_TO_ENGLISH: Record<string, string> = {
  // Vowels
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
  
  // Consonants
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy',
  
  // Matras (vowel signs)
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h',
  '्': '', // Halant (removes inherent vowel)
  
  // Numbers
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  
  // Common Hindi words (for better SEO)
  'समाचार': 'samachar', 'खबर': 'khabar', 'न्यूज़': 'news',
  'देश': 'desh', 'राज्य': 'rajya', 'शहर': 'shahar',
  'महिला': 'mahila', 'पुरुष': 'purush', 'बच्चे': 'bacche',
};

/**
 * Extended transliteration for common Hindi phrases and words
 */
const HINDI_PHRASES: Record<string, string> = {
  'का': 'ka', 'की': 'ki', 'के': 'ke', 'को': 'ko',
  'से': 'se', 'में': 'mein', 'पर': 'par', 'तक': 'tak',
  'और': 'aur', 'या': 'ya', 'लेकिन': 'lekin', 'क्योंकि': 'kyunki',
};

/**
 * Check if a string contains non-Latin characters (Hindi, Arabic, etc.)
 */
function containsNonLatin(text: string): boolean {
  return /[^\x00-\x7F]/.test(text);
}

/**
 * Transliterate Hindi (Devanagari) characters to English
 */
function transliterateHindi(text: string): string {
  let result = '';
  
  // First, try to match common phrases
  for (const [hindi, english] of Object.entries(HINDI_PHRASES)) {
    if (text.includes(hindi)) {
      text = text.replace(new RegExp(hindi, 'g'), english);
    }
  }
  
  // Then transliterate character by character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    // Check for combined characters (consonant + matra)
    if (i < text.length - 1) {
      const combined = char + nextChar;
      if (HINDI_TO_ENGLISH[combined]) {
        result += HINDI_TO_ENGLISH[combined];
        i++; // Skip next character as it's part of combined
        continue;
      }
    }
    
    // Single character transliteration
    if (HINDI_TO_ENGLISH[char]) {
      result += HINDI_TO_ENGLISH[char];
    } else if (/[\u0900-\u097F]/.test(char)) {
      // Devanagari range but not in our mapping - use Unicode normalization
      try {
        // Try to get a basic transliteration using Unicode normalization
        const normalized = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalized !== char) {
          result += normalized.toLowerCase();
        } else {
          // Fallback: remove or replace with placeholder
          result += '';
        }
      } catch {
        result += '';
      }
    } else {
      // Keep non-Devanagari characters as-is
      result += char;
    }
  }
  
  return result;
}

/**
 * Generate a hash-based slug fallback when transliteration fails
 */
function generateHashSlug(text: string, maxLength: number = 50): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base36 and take first maxLength characters
  const hashStr = Math.abs(hash).toString(36);
  return hashStr.substring(0, maxLength);
}

/**
 * Clean and normalize the slug
 */
function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s_\-]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]/g, '')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 200);
}

/**
 * Generate SEO-friendly slug from text
 * Handles English, Hindi, and other Unicode characters
 * 
 * @param text - Input text (can be in any language)
 * @param options - Optional configuration
 * @returns SEO-friendly slug
 */
export function generateSlug(
  text: string,
  options: {
    maxLength?: number;
    fallbackToHash?: boolean;
  } = {}
): string {
  const { maxLength = 200, fallbackToHash = true } = options;
  
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Trim and normalize whitespace
  let processed = text.trim().replace(/\s+/g, ' ');
  
  // Check if text contains non-Latin characters
  if (containsNonLatin(processed)) {
    // Try transliteration for Hindi/Devanagari
    if (/[\u0900-\u097F]/.test(processed)) {
      processed = transliterateHindi(processed);
    } else {
      // For other non-Latin scripts, try Unicode normalization
      try {
        processed = processed
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^\x00-\x7F]/g, ''); // Remove remaining non-ASCII
      } catch {
        // If normalization fails, use hash fallback
        if (fallbackToHash) {
          return generateHashSlug(text, maxLength);
        }
        return '';
      }
    }
  }
  
  // Clean the slug
  let slug = cleanSlug(processed);
  
  // If slug is empty or too short after processing, use hash fallback
  if (slug.length < 3 && fallbackToHash) {
    slug = generateHashSlug(text, maxLength);
  }
  
  // Ensure minimum length
  if (slug.length === 0) {
    slug = 'news-' + Date.now().toString(36);
  }
  
  return slug.substring(0, maxLength);
}

/**
 * Generate unique slug by appending number if duplicate exists
 * This should be used with database check
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}


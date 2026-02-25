const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*';

/**
 * Generate a random password with at least one character from each class.
 */
export function generatePassword(length = 16): string {
  const allChars = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;

  // Ensure at least one from each category
  const mandatory = [
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    SPECIAL[Math.floor(Math.random() * SPECIAL.length)],
  ];

  const remaining = Array.from({ length: length - mandatory.length }, () =>
    allChars.charAt(Math.floor(Math.random() * allChars.length)),
  );

  // Shuffle to avoid predictable positions
  const chars = [...mandatory, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

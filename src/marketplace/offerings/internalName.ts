const INTERNAL_NAME_CHARACTERS = 'a-zA-Z0-9_\\-/:';

// Shared with the internal-name fields for validation and auto-generation.
export const INTERNAL_NAME_PATTERN = new RegExp(
  `^[${INTERNAL_NAME_CHARACTERS}]+$`,
);

const DISALLOWED_CHARACTERS = new RegExp(`[^${INTERNAL_NAME_CHARACTERS}]`, 'g');

// Derive an internal name from a display name in lowercase snake_case: lowercase
// everything, treat whitespace and hyphens as word separators (underscores), and
// drop everything else the internal-name pattern rejects (slashes and colons are
// kept as structural separators). The result passes validateInternalName as-is
// (the field's parse() is not applied to programmatic form.change calls).
export const cleanInternalName = (displayName: string): string => {
  if (!displayName) {
    return '';
  }
  return displayName
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(DISALLOWED_CHARACTERS, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
};

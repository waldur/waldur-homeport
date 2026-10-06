// The types chat media may keep: they render inertly in <img>, <video> and
// <audio>, and open harmlessly in a tab.
export const IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const AUDIO_TYPES = [
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
];

const INLINE_SAFE = new Set([...IMAGE_TYPES, ...VIDEO_TYPES, ...AUDIO_TYPES]);

/**
 * The type to give a downloaded attachment's blob. A blob URL keeps the
 * sender's type and opens in Waldur's own origin, so a type that could run
 * script there, such as HTML or SVG, becomes a download instead.
 *
 * Only the bare allowlisted type survives: a browser re-parses the blob's
 * type when it opens it, reading a comma as a list whose last entry wins, so
 * "image/png;a=b,text/html" would open as HTML.
 */
export const inlineSafeType = (type: string) => {
  if (type.includes(',')) return 'application/octet-stream';
  const essence = type.split(';')[0].trim().toLowerCase();
  return INLINE_SAFE.has(essence) ? essence : 'application/octet-stream';
};

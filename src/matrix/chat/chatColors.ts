const CHAT_AVATAR_PALETTE = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
] as const;

type ChatAvatarColor = (typeof CHAT_AVATAR_PALETTE)[number];

/** Map an identifier (room uuid, user id) to a stable theme colour. */
export function getChatAvatarColor(seed: string): ChatAvatarColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) | 0;
  }
  return CHAT_AVATAR_PALETTE[Math.abs(hash) % CHAT_AVATAR_PALETTE.length];
}

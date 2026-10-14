const CHAT_AVATAR_PALETTE = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
] as const;

type ChatAvatarColor = (typeof CHAT_AVATAR_PALETTE)[number];

/** Map an identifier (room uuid, user id) to a stable theme colour. */
function getChatAvatarColor(seed: string): ChatAvatarColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) | 0;
  }
  return CHAT_AVATAR_PALETTE[Math.abs(hash) % CHAT_AVATAR_PALETTE.length];
}

const CHAT_AVATAR_COLOR_CLASSES: Record<ChatAvatarColor, string> = {
  primary: 'bg-brand-subtle text-brand',
  success: 'bg-success-subtle text-success',
  info: 'bg-info-subtle text-info',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
};

export function getChatAvatarClass(seed: string): string {
  return CHAT_AVATAR_COLOR_CLASSES[getChatAvatarColor(seed)];
}

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';

/** Read the public MATRIX_ENABLED constance flag from configuration. */
export const isMatrixEnabled = (): boolean =>
  Boolean(ENV.plugins?.WALDUR_CORE?.MATRIX_ENABLED);

/**
 * Matrix chat is usable only when the UI feature flag is on AND the backend
 * integration is enabled. The two switches are independent, so the flag alone
 * leaves the UI calling a disabled backend (404s on credentials/rooms).
 */
export const isMatrixChatEnabled = (): boolean =>
  isFeatureVisible(ProjectFeatures.show_matrix_chat) && isMatrixEnabled();

/**
 * Web address of a room, for handing it over to an external Matrix client.
 *
 * matrix.to rather than a `matrix:` URI, which the browser rejects outright
 * when no installed client registered the scheme. On desktop matrix.to still
 * tries the client's native link first (`element://…`), which fails the same
 * way without the app, but it then offers a download and the web client
 * instead of a dead end. Mentions in the composer already address users this way.
 */
export const getMatrixRoomUrl = (roomAlias?: string): string | null => {
  if (!roomAlias) return null;
  const alias = roomAlias.startsWith('#') ? roomAlias : `#${roomAlias}`;
  return `https://matrix.to/#/${encodeURIComponent(alias)}`;
};

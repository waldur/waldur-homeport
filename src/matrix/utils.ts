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

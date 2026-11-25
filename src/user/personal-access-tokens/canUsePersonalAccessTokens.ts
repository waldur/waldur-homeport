import { ENV } from '@/core/config';

/**
 * Whether the user may create and use personal access tokens, as the backend
 * decides (waldur/waldur-mastermind#1315): PAT_ENABLED gives them to every
 * user; while it is off, only users with the can_use_personal_access_tokens
 * flag have them. Staff are not special-cased.
 */
export const canUsePersonalAccessTokens = (
  user: { can_use_personal_access_tokens?: boolean } | null | undefined,
): boolean =>
  Boolean(
    user &&
    (ENV.plugins.WALDUR_CORE.PAT_ENABLED ||
      user.can_use_personal_access_tokens),
  );

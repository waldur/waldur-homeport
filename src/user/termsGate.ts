import { User } from 'waldur-js-client';

import { ImpersonationStorage } from '@/core/StorageManager';

export const isImpersonating = (): boolean =>
  Boolean(ImpersonationStorage.get());

/**
 * Whether the Terms of Service no longer gate this session. Staff impersonating
 * a user act as them but may not accept on their behalf, so a missing
 * acceptance must not lock them out of the user's account.
 */
export const termsAcceptedOrImpersonating = (user: User): boolean =>
  Boolean(user.agreement_date) || isImpersonating();

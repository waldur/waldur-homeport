import { getServiceAccessMode } from '@/marketplace/serviceAccessMode';

export const DEFAULT_REDIRECT_STATE = 'profile.details';

const CALLS_LANDING_STATE = 'calls-for-proposals-dashboard';

/**
 * Where the app starts when no page was asked for: after signing in, at the
 * bare URL, from the header's back button with nothing to go back to.
 *
 * In calls-only mode calls are the way in, so everyone -- anonymous visitors
 * included, the list being public -- starts on them rather than on a profile
 * page that offers nothing to apply for.
 */
export const getLandingState = (): string =>
  getServiceAccessMode() === 'calls'
    ? CALLS_LANDING_STATE
    : DEFAULT_REDIRECT_STATE;

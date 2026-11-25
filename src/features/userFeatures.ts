import type { Middleware } from 'redux';

import { mergeFeatureFlags } from 'waldur-shell';

import { ENV } from '@/core/config';
import { SET_CURRENT_USER } from '@/workspace/constants';

type Flags = Record<string, Record<string, boolean>>;

/**
 * The flags as the configuration endpoint sends them to everyone, before any
 * user's own values are laid over them.
 */
let publicFeatures: Flags | undefined;

/** Keeps the public flags; called once the configuration has loaded. */
export const rememberPublicFeatures = () => {
  publicFeatures = structuredClone(ENV.FEATURES ?? {});
};

/**
 * The deployment-wide flags. What staff edit in Administration → Features:
 * ENV.FEATURES also holds the values feature rules give the signed-in user,
 * and saving those would turn them on for everyone.
 */
export const getPublicFeatures = (): Flags =>
  publicFeatures ?? ENV.FEATURES ?? {};

/**
 * Records a global value staff just saved, in the public flags and in
 * ENV.FEATURES alike, so the next /users/me/ does not lay the old one back.
 */
export const setPublicFeature = (
  section: string,
  key: string,
  value: boolean,
) => {
  const set = (flags: Flags | undefined): Flags => ({
    ...flags,
    [section]: { ...flags?.[section], [key]: value },
  });
  if (publicFeatures) publicFeatures = set(publicFeatures);
  ENV.FEATURES = set(ENV.FEATURES);
};

/**
 * Lays the user's values of the user-scoped flags (/users/me/ features) over
 * the public ones. /users/me/ answers every user-scoped flag, so the previous
 * user's values never survive a switch of identity.
 */
export const applyUserFeatures = (features: Flags | undefined) => {
  ENV.FEATURES = mergeFeatureFlags(getPublicFeatures(), features) as Flags;
};

/** Back to the public flags, once nobody is signed in. */
export const resetUserFeatures = () => {
  if (publicFeatures) {
    ENV.FEATURES = structuredClone(publicFeatures);
  }
};

/**
 * Applies the user's flags on every SET_CURRENT_USER, the single funnel for
 * login, session refresh, impersonation and logout. Only a /users/me/ answer
 * carries `features`; a user object from another endpoint (a profile update,
 * say) leaves the flags as they are.
 */
export const userFeaturesMiddleware: Middleware =
  () => (next) => (action: any) => {
    if (action?.type === SET_CURRENT_USER) {
      const user = action.payload?.user;
      if (!user) {
        resetUserFeatures();
      } else if (user.features) {
        applyUserFeatures(user.features);
      }
    }
    return next(action);
  };

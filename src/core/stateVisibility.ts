import { StateDeclaration } from '@uirouter/core';

import { isFeatureVisible } from '@/features/connect';
import { router } from '@/router';

/**
 * Parent of a registered state: either the explicit `parent` field or, for
 * dot-notation states (`profile.details`), the prefix of the name.
 */
const getParentState = (state: StateDeclaration): StateDeclaration | null => {
  if (state.parent) {
    return router.stateRegistry.get(state.parent) || null;
  }
  const name = String(state.name || '');
  const separator = name.lastIndexOf('.');
  return separator > 0
    ? router.stateRegistry.get(name.slice(0, separator)) || null
    : null;
};

/**
 * Feature gate of a router state, mirroring the `data.feature` check that
 * `transitions.ts` runs on every transition. Navigation surfaces use it to
 * conceal links to states this deployment has disabled instead of letting the
 * user click through to the feature-disabled error page.
 *
 * Only feature flags are considered. They are static deployment config, so the
 * answer is the same wherever the link is rendered. `data.permissions`
 * predicates are deliberately left out: they are evaluated against the
 * workspace context of the state being entered, which a link rendered from
 * some other page does not have yet.
 *
 * An unknown state name is treated as visible — concealment is for pages the
 * deployment has switched off, not for typos, which must stay loud.
 */
export const isStateVisible = (stateName: string): boolean => {
  if (!stateName) {
    return true;
  }
  let state = router.stateRegistry.get(stateName);
  if (!state) {
    return true;
  }
  while (state) {
    if (!isFeatureVisible(state.data?.feature)) {
      return false;
    }
    state = getParentState(state);
  }
  return true;
};

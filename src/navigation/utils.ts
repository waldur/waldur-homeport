import { isFeatureVisible } from '@waldur/features/connect';
import { router } from '@waldur/router';
import { hasPermission } from '@waldur/utils';

let state;
let params;

export function setPrevState(newState) {
  state = newState;
}

export function setPrevParams(newParams) {
  params = newParams;
}

export const goBack = () => {
  if (state && state.name && state.name !== 'errorPage.notFound') {
    router.stateService.go(state.name, params);
  } else {
    router.stateService.go('profile.details');
  }
};

export const getFilteredTabs = async (tabs) => {
  if (!tabs) return [];
  const filtered = [];
  for (const tab of tabs) {
    const state = router.stateService.get(tab.to);
    if (state?.data?.feature) {
      if (!isFeatureVisible(state.data.feature)) {
        continue;
      }
    }

    const permissionFn = (state?.resolve as any)?.permission;
    if (permissionFn) {
      if (await hasPermission()) {
        filtered.push(tab);
      }
    } else {
      filtered.push(tab);
    }
  }
  return filtered;
};

import { StateDeclaration } from '@uirouter/react';

import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { hasPermission } from '@waldur/utils';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

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
    if (tab.children && tab.children.length) {
      // Tab has children
      const filteredChildren = [];
      for (const childTab of tab.children) {
        const state = router.stateService.get(childTab.to);
        if (await canShow(state)) {
          filteredChildren.push(childTab);
        }
      }
      if (filteredChildren.length) {
        filtered.push({ ...tab, children: filteredChildren });
      }
    } else {
      // Tab is single
      const state = router.stateService.get(tab.to);
      if (await canShow(state)) {
        filtered.push(tab);
      }
    }
  }
  return filtered;
};

const canShow = async (state: StateDeclaration) => {
  if (state?.data?.feature) {
    if (!isFeatureVisible(state.data.feature)) {
      return false;
    }
  }
  if (!hasExtraPermissions(state)) {
    return false;
  }

  const permissionFn = (state?.resolve as any)?.permission;

  if (permissionFn) {
    if (await hasPermission()) {
      return true;
    }
  } else {
    return true;
  }
};

const hasExtraPermissions = (state: StateDeclaration) => {
  if (state.name === 'project.invitations') {
    const user = getUser(store.getState());
    const customer = getCustomer(store.getState());
    const project = getProject(store.getState());
    const canAccess = InvitationPolicyService.canAccessInvitations({
      user,
      customer,
      project,
    });
    if (canAccess) return true;
    return false;
  }
  return true;
};

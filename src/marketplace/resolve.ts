import { Transition } from '@uirouter/react';

import { getProjectPermission } from '@waldur/permissions/utils';
import { getCustomer, getProject } from '@waldur/project/api';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import {
  getProject as getProjectSelector,
  getCustomer as getCustomerSelector,
  getUser as getUserSelector,
} from '@waldur/workspace/selectors';

import { getServiceProviderByCustomer } from './common/api';

/**
 * Use it to fetch and select organization and project by default in public routes
 */
export function loadContext() {
  async function loadData() {
    const currentProject = getProjectSelector(store.getState());
    const currentCustomer = getCustomerSelector(store.getState());
    const currentUser = getUserSelector(store.getState());
    if (!currentCustomer && !currentProject) {
      try {
        const projectPermission = getProjectPermission(currentUser);
        if (projectPermission) {
          const newProject = await getProject(projectPermission.scope_uuid);
          store.dispatch(setCurrentProject(newProject));
          const newCustomer = await getCustomer(newProject.customer_uuid);
          store.dispatch(setCurrentCustomer(newCustomer));
        }
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }
  return loadData();
}

export const fetchProvider = (transition: Transition) =>
  getServiceProviderByCustomer({
    customer_uuid: transition.params().uuid,
  });

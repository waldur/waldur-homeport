import { Transition } from '@uirouter/react';

import { getFirst } from '@waldur/core/api';
import { getCustomer, getProject } from '@waldur/project/api';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import {
  getProject as getProjectSelector,
  getCustomer as getCustomerSelector,
} from '@waldur/workspace/selectors';
import { Permission } from '@waldur/workspace/types';

import { getServiceProviderByCustomer } from './common/api';

/**
 * Use it to fetch and select organization and project by default in public routes
 */
export function loadContext() {
  async function loadData() {
    const currentProject = getProjectSelector(store.getState());
    const currentCustomer = getCustomerSelector(store.getState());
    if (!currentCustomer && !currentProject) {
      try {
        const projectPermission = await getFirst<Permission>(
          '/project-permissions/',
          undefined,
          { __skipLogout__: true } as any,
        );
        if (projectPermission) {
          const newProject = await getProject(projectPermission.project_uuid);
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

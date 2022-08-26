import { Transition, UIView } from '@uirouter/react';
import { triggerTransition } from '@uirouter/redux';

import { getFirst } from '@waldur/core/api';
import { getCustomer } from '@waldur/project/api';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import {
  checkCustomerUser,
  checkIsServiceManager,
  getProject as getProjectSelector,
  getUser,
} from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE, Project } from '@waldur/workspace/types';

import { useCustomerItems } from '../utils';

export async function fetchCustomer(transition: Transition) {
  const project = getProjectSelector(store.getState());
  const currentUser = getUser(store.getState());
  const customerId = transition.params()?.uuid;

  if (!customerId) {
    store.dispatch(triggerTransition('errorPage.notFound', {}));
  } else {
    try {
      const currentCustomer = await getCustomer(customerId);
      store.dispatch(setCurrentCustomer(currentCustomer));
      if (!project || project.customer_uuid != customerId) {
        const newProject = await getFirst<Project>('/projects/', {
          customer: customerId,
        });
        store.dispatch(setCurrentProject(newProject));
      }
      store.dispatch(setCurrentWorkspace(ORGANIZATION_WORKSPACE));

      if (
        !checkCustomerUser(currentCustomer, currentUser) &&
        !checkIsServiceManager(currentCustomer, currentUser) &&
        !currentUser.is_support
      ) {
        store.dispatch(triggerTransition('errorPage.notFound', {}));
      }
    } catch {
      store.dispatch(triggerTransition('errorPage.notFound', {}));
    }
  }
}

export const CustomerContainer = () => {
  useCustomerItems();
  return <UIView />;
};

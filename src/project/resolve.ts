import { Transition } from '@uirouter/react';

import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { getProject, getCustomer } from './api';

export function loadProject(transition: Transition) {
  if (!transition.params().uuid) {
    return router.stateService.go('errorPage.notFound');
  }

  async function loadData() {
    try {
      store.dispatch(setCurrentWorkspace(PROJECT_WORKSPACE));
      const project = await getProject(transition.params().uuid);
      const customer = await getCustomer(project.customer_uuid);
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(project));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}

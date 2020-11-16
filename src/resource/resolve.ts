import { getById } from '@waldur/core/api';
import { $q, $state } from '@waldur/core/services';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { Project, PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { ResourcesService } from './ResourcesService';

export function loadResource($stateParams) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }

  return ResourcesService.get($stateParams.resource_type, $stateParams.uuid)
    .then((resource) => {
      return getById<Project>('/projects/', resource.project_uuid).then(
        (project) => {
          return { project };
        },
      );
    })
    .then(({ project }) => {
      return CustomersService.get(project.customer_uuid).then((customer) => {
        store.dispatch(setCurrentCustomer(customer));
        store.dispatch(setCurrentProject(project));
        store.dispatch(setCurrentWorkspace(PROJECT_WORKSPACE));
        return { customer, project };
      });
    })
    .catch((response) => {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

loadResource.$inject = ['$stateParams'];

import { getById } from '@waldur/core/api';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';

import { ResourcesService } from './ResourcesService';

// @ngInject
export function loadResource($stateParams, $q, $state, WorkspaceService) {
  if (!$stateParams.uuid) {
    return $q.reject();
  }

  return ResourcesService.get($stateParams.resource_type, $stateParams.uuid)
    .then((resource) => {
      return getById('/projects/', resource.project_uuid).then((project) => {
        return { project };
      });
    })
    .then(({ project }) => {
      return CustomersService.get(project.customer_uuid).then((customer) => {
        store.dispatch(setCurrentCustomer(customer));
        store.dispatch(setCurrentProject(project));
        return { customer, project };
      });
    })
    .then(({ customer, project }) => {
      WorkspaceService.setWorkspace({
        customer: customer,
        project: project,
        hasCustomer: true,
        workspace: WOKSPACE_NAMES.project,
      });
    })
    .catch((response) => {
      if (response.status === 404) {
        $state.go('errorPage.notFound');
      }
    });
}

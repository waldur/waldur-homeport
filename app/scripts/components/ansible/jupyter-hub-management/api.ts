import {
  buildJupyterHubManagementCreatePayload,
  buildJupyterHubManagementUpdatePayload
} from '@waldur/ansible/jupyter-hub-management/mappers';
import { JupyterHubManagementDetailsFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementDetailsFormData';
import { JupyterHubManagementFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementFormData';
import { $http, $state, ENV } from '@waldur/core/services';

const JUPYTER_HUB_MANAGEMENT_ENDPOINT = 'jupyter-hub-management';
const JUPYTER_HUB_MANAGEMENT_REQUESTS_ENDPOINT = 'requests';

export const createJupyterHubManagement = jupyterHubManagementClientPayload =>
  $http.post(`${ENV.apiEndpoint}api/${JUPYTER_HUB_MANAGEMENT_ENDPOINT}/`, buildJupyterHubManagementCreatePayload(jupyterHubManagementClientPayload));

export const updateJupyterHubManagement = (jupyterHubManagementClientPayload: JupyterHubManagementDetailsFormData) =>
  $http.patch(
    `${ENV.apiEndpoint}api/${JUPYTER_HUB_MANAGEMENT_ENDPOINT}/${jupyterHubManagementClientPayload.uuid}/`,
    buildJupyterHubManagementUpdatePayload(jupyterHubManagementClientPayload));

export const deleteJupyterHubManagement = (jupyterHubManamgent: JupyterHubManagementFormData) =>
  $http.delete(`${ENV.apiEndpoint}api/${JUPYTER_HUB_MANAGEMENT_ENDPOINT}/${jupyterHubManamgent.uuid}/`);

export const gotoJupyterHubManagementDetails = (jupyterHubManagement, project) =>
  $state.go('project.resources.jupyterHubManagement.details', {
    uuid: project.uuid,
    jupyterHubManagementUuid: jupyterHubManagement.uuid,
  });

export const loadJupyterHubManagement = jupyterHubManagementUuid =>
  $http.get(`${ENV.apiEndpoint}api/${JUPYTER_HUB_MANAGEMENT_ENDPOINT}/${jupyterHubManagementUuid}`)
    .then(response => response.data);

export const loadJupyterHubManagementRequest = (jupyterHubManagementUuid: string, requestUuid: string) =>
  $http.get(`${ENV.apiEndpoint}api/${JUPYTER_HUB_MANAGEMENT_ENDPOINT}/${jupyterHubManagementUuid}/${JUPYTER_HUB_MANAGEMENT_REQUESTS_ENDPOINT}/${requestUuid}`)
    .then(response => response.data);

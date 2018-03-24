import { $http, $state, ENV } from '@waldur/core/services';
import { buildPythonManagementCreatePayload, buildVirtualEnvironmentPayload } from '@waldur/python-management/mappers';
import { InstalledLibrariesSearchDs } from '@waldur/python-management/types/InstalledLibrariesSearchDs';
import { PythonManagementFormData } from '@waldur/python-management/types/PythonManagementFormData';

const PYTHON_MANAGEMENT_ENDPOINT = 'python-management';
const PYTHON_MANAGEMENT_REQUESTS_ENDPOINT = 'requests';
const PIP_PACKAGES_ENDPOINT = 'pip-packages';
const PIP_PACKAGES_AUTOCOMPLETE_ENDPOINT = 'autocomplete_library';
const PIP_PACKAGES_FIND_LIBRARY_VERSIONS_ENDPOINT = 'find_library_versions';

export const createPythonManagement = pythonManagementClientPayload =>
  $http
    .post(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/`, buildPythonManagementCreatePayload(pythonManagementClientPayload));

export const updatePythonManagement = (pythonManagement: PythonManagementFormData) =>
  $http.patch(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/${pythonManagement.uuid}/`, {
    virtual_environments: pythonManagement.virtualEnvironments.map(ve => buildVirtualEnvironmentPayload(ve)),
  });

export const deletePythonManagement = (pythonManagement: PythonManagementFormData) =>
  $http.delete(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/${pythonManagement.uuid}/`);

export const autocompleteLibraryName = (libraryName: string) =>
  $http.get(`${ENV.apiEndpoint}api/${PIP_PACKAGES_ENDPOINT}/${PIP_PACKAGES_AUTOCOMPLETE_ENDPOINT}/${libraryName}/`);

export const findLibraryVersions = (libraryName: string, pythonVersion: string) =>
  $http.get(`${ENV.apiEndpoint}api/${PIP_PACKAGES_ENDPOINT}/${PIP_PACKAGES_FIND_LIBRARY_VERSIONS_ENDPOINT}/${libraryName}/${pythonVersion}/`);

export const findVirtualEnvironments = (pythonManagementUuid: string) =>
  $http.get(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/${pythonManagementUuid}/find_virtual_environments/`);

export const findInstalledLibsInVirtualEnvironment = (requestData: InstalledLibrariesSearchDs) =>
  $http.get(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/${requestData.pythonManagementUuid}/find_installed_libraries/${requestData.virtualEnvironmentName}`);

export const gotoPythonManagementDetails = (pythonManagement, project) =>
  $state.go('project.resources.pythonManagement.details', {
    uuid: project.uuid,
    pythonManagementUuid: pythonManagement.uuid,
  });

export const loadPythonManagement = pythonManagementUuid =>
  $http.get(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/${pythonManagementUuid}`)
    .then(response => response.data);

export const loadPythonManagementRequest = (pythonManagementUuid, requestUuid) =>
  $http.get(`${ENV.apiEndpoint}api/${PYTHON_MANAGEMENT_ENDPOINT}/${pythonManagementUuid}/${PYTHON_MANAGEMENT_REQUESTS_ENDPOINT}/${requestUuid}`)
    .then(response => response.data);

export const goToApplicationsList = project =>
  $state.go('project.resources.ansible.list', {uuid: project.uuid});

export const goToInstanceDetails = instanceUuid =>
  $state.go('resources.details', {resource_type: 'OpenStackTenant.Instance', uuid: instanceUuid});

export const loadByUrl = (url: string) =>
  $http.get(url).then(response => response.data);

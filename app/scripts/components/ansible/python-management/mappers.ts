import {Instance} from '@waldur/ansible/python-management/types/Instance';
import {Library} from '@waldur/ansible/python-management/types/Library';
import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {PythonManagementRequest} from '@waldur/ansible/python-management/types/PythonManagementRequest';
import {PythonManagementRequestState} from '@waldur/ansible/python-management/types/PythonManagementRequestState';
import {PythonManagementRequestStateTypePair} from '@waldur/ansible/python-management/types/PythonManagementRequestStateTypePair';
import {PythonManagementRequestType} from '@waldur/ansible/python-management/types/PythonManagementRequestType';
import {VirtualEnvironment} from '@waldur/ansible/python-management/types/VirtualEnvironment';

export function buildPythonManagementCreatePayload(clientPayload: any) {
  return {
    service_project_link: clientPayload.selectedInstance.service_project_link,
    instance: clientPayload.selectedInstance.url,
    virtual_envs_dir_path: clientPayload.virtualEnvironmentsDirectory,
    virtual_environments: clientPayload.virtualEnvironments.map(ve => buildVirtualEnvironmentPayload(ve)),
  };
}

export function buildVirtualEnvironmentPayload(virtualEnvironment: VirtualEnvironment) {
  return {
    name: virtualEnvironment.name,
    installed_libraries: virtualEnvironment.installedLibraries.map(library => buildLibraryPayload(library)),
  };
}

function buildLibraryPayload(library: Library) {
  return {
    name: library.name.value,
    version: library.version.value,
  };
}

export function buildPythonManagementCreateFormData(serverPayload, instance): PythonManagementFormData {
  const formData = new PythonManagementFormData();
  const pythonManagementPayload = serverPayload.python_management;
  formData.uuid = pythonManagementPayload.uuid;
  formData.virtualEnvironmentsDirectory = pythonManagementPayload.virtual_envs_dir_path;
  formData.virtualEnvironments = pythonManagementPayload.virtual_environments.map(ve => buildVirtualEnvironmentFormData(ve));
  if (instance) {
    formData.instance = buildInstance(instance);
  }
  formData.requestsStateTypePairs = pythonManagementPayload.requests_states.map(state => buildRequestsStatesStateTypePairs(state));
  formData.requests = buildPythonManagementRequestsFull(serverPayload.requests);
  formData.pythonVersion = pythonManagementPayload.python_version;
  return formData;
}

export function buildRequestsStatesStateTypePairs(stateServerPayload): PythonManagementRequestStateTypePair {
  return new PythonManagementRequestStateTypePair(
    stateServerPayload.state as PythonManagementRequestState,
    stateServerPayload.request_type as PythonManagementRequestType);
}

function buildInstance(instanceServerPayload) {
  const instance = new Instance();
  instance.uuid = instanceServerPayload.uuid;
  instance.name = instanceServerPayload.name;
  instance.imageName = instanceServerPayload.image_name;
  instance.ram = instanceServerPayload.ram;
  instance.cores = instanceServerPayload.cores;
  instance.disk = instanceServerPayload.disk;
  instance.url = instanceServerPayload.url;
  return instance;
}

function buildVirtualEnvironmentFormData(virtualEnvironment) {
  return new VirtualEnvironment(
    virtualEnvironment.name,
    virtualEnvironment.uuid,
    virtualEnvironment.installed_libraries.map(library => buildLibraryFormData(library)));
}

function buildLibraryFormData(library) {
  return new Library(library.name, library.version, library.uuid);
}

export function buildPythonManagementRequestsFull(requests: any[]): PythonManagementRequest[] {
  return requests.map(r => buildPythonManagementRequestFull(r));
}

export function buildPythonManagementRequestFull(requestServerPayload: any): PythonManagementRequest {
  const result = new PythonManagementRequest();
  result.created = new Date(requestServerPayload.created);
  result.uuid = requestServerPayload.uuid;
  result.output = requestServerPayload.output;
  result.requestType = requestServerPayload.request_type as PythonManagementRequestType;
  result.requestState = requestServerPayload.state as PythonManagementRequestState;
  result.virtualEnvironmentName = requestServerPayload.virtual_env_name;
  result.librariesToInstall = requestServerPayload.libraries_to_install;
  result.librariesToRemove = requestServerPayload.libraries_to_remove;
  return result;
}

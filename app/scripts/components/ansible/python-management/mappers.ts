import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { Library } from '@waldur/ansible/python-management/types/Library';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export function buildPythonManagementCreatePayload(clientPayload: any) {
  return {
    instance: clientPayload.selectedInstance.url,
    virtual_envs_dir_path: clientPayload.virtualEnvironmentsDirectory,
    virtual_environments: clientPayload.virtualEnvironments.map(ve => buildVirtualEnvironmentPayload(ve)),
    system_user: clientPayload.systemUser,
  };
}

export function buildVirtualEnvironmentPayload(virtualEnvironment: VirtualEnvironment) {
  return {
    name: virtualEnvironment.name,
    installed_libraries: virtualEnvironment.installedLibraries.map(library => buildLibraryPayload(library)),
    jupyter_hub_global: virtualEnvironment.jupyterHubGlobal,
  };
}

function buildLibraryPayload(library: Library) {
  return {
    name: library.name.value,
    version: library.version.value,
  };
}

export function buildPythonManagementFormData(serverPayload, instance?): PythonManagementFormData {
  const formData = new PythonManagementFormData();
  const pythonManagementPayload = serverPayload.python_management;
  formData.uuid = pythonManagementPayload.uuid;
  formData.virtualEnvironmentsDirectory = pythonManagementPayload.virtual_envs_dir_path;
  formData.virtualEnvironments = pythonManagementPayload.virtual_environments.map(ve => buildVirtualEnvironmentFormData(ve));
  if (instance) {
    formData.instance = buildInstance(instance);
  }
  formData.managementState = pythonManagementPayload.state as ManagementRequestState;
  formData.requests = buildPythonManagementRequestsFull(serverPayload.requests);
  formData.pythonVersion = pythonManagementPayload.python_version;
  formData.systemUser = pythonManagementPayload.system_user;
  return formData;
}

export function buildInstance(instanceServerPayload) {
  const instance = new Instance();
  instance.uuid = instanceServerPayload.uuid;
  instance.name = instanceServerPayload.name;
  instance.imageName = instanceServerPayload.image_name;
  instance.firstExternalIp = instanceServerPayload.floating_ips ? instanceServerPayload.floating_ips[0].address : null;
  instance.ram = instanceServerPayload.ram;
  instance.cores = instanceServerPayload.cores;
  instance.disk = instanceServerPayload.disk;
  instance.url = instanceServerPayload.url;
  instance.state = instanceServerPayload.state;
  instance.serviceProjectLink = instanceServerPayload.service_project_link;
  return instance;
}

export function buildVirtualEnvironmentFormData(virtualEnvironment) {
  return new VirtualEnvironment(
    virtualEnvironment.name,
    virtualEnvironment.uuid,
    virtualEnvironment.installed_libraries.map(library => buildLibraryFormData(library)),
    virtualEnvironment.jupyter_hub_global);
}

function buildLibraryFormData(library) {
  return new Library(library.name, library.version, library.uuid);
}

export function buildPythonManagementRequestsFull(requests: any[]): PythonManagementRequest[] {
  return requests.map(r => buildPythonManagementRequestFull(r));
}

export function buildPythonManagementRequestFull(requestServerPayload: any): PythonManagementRequest {
  const result = new PythonManagementRequest();
  fillCommonManagementRequestFields(requestServerPayload, result);
  result.requestType = requestServerPayload.request_type as PythonManagementRequestType;
  result.librariesToInstall = requestServerPayload.libraries_to_install;
  result.librariesToRemove = requestServerPayload.libraries_to_remove;
  return result;
}

export function fillCommonManagementRequestFields<R extends ManagementRequest<R>>(
  requestServerPayload: any, targetRequest: R): void {
  targetRequest.created = new Date(requestServerPayload.created);
  targetRequest.uuid = requestServerPayload.uuid;
  targetRequest.output = requestServerPayload.output;
  targetRequest.requestState = requestServerPayload.state as ManagementRequestState;
  targetRequest.virtualEnvironmentName = requestServerPayload.virtual_env_name;
}

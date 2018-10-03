import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestsHolder } from '@waldur/ansible/python-management/types/ManagementRequestsHolder';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class VirtualEnvironmentNotEditableDs<R extends ManagementRequest<R>> {
  virtualEnvironments: VirtualEnvironment[];
  allRequests: Array<ManagementRequest<R>>;

  constructor(managementFormData: VirtualEnvAndRequestsContainer<R>) {
    this.virtualEnvironments = managementFormData.getVirtualEnvironments(managementFormData);
    this.allRequests = managementFormData.getAllRequests(managementFormData);
  }
}

export const isVirtualEnvironmentNotEditable =
  <R extends ManagementRequest<R>>
  (virtualEnvironmentNotEditableDs: VirtualEnvironmentNotEditableDs<R>, index: number, timeout: number): boolean => {

    const virtualEnvironment = virtualEnvironmentNotEditableDs.virtualEnvironments[index];
    if (virtualEnvironment) {
      const virtualEnvironmentName = virtualEnvironment.name;
      if (virtualEnvironmentNotEditableDs.allRequests) {
        return virtualEnvironmentNotEditableDs.allRequests.some((r: R) =>
          isExecuting(r, timeout) && (isGlobalRequest(r) || r.virtualEnvironmentName === virtualEnvironmentName));
      }
    } else {
      return true;
    }
  };

export const existsExecutingGlobalRequest =
  <R extends ManagementRequest<R>>
  (pythonManagement: ManagementRequestsHolder<R>, timeout: number): boolean => {

    if (pythonManagement && pythonManagement.requests) {
      return pythonManagement.requests.some(r => isExecuting(r, timeout) && isGlobalRequest(r));
    }
    return false;

  };

export function isGlobalRequest<R extends ManagementRequest<R>>(request: R): boolean {
  return !request.virtualEnvironmentName;
}

export function isExecuting<R extends ManagementRequest<R>>(request: R, timeout: number): boolean {
  const differenceInSeconds = ((new Date()).valueOf() - request.created.valueOf()) / 1000;
  return differenceInSeconds < timeout
    && request.requestState !== ManagementRequestState.OK
    && request.requestState !== ManagementRequestState.ERRED;
}

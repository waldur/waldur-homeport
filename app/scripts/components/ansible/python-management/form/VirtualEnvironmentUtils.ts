import {PythonManagementFormData} from '@waldur/ansible/python-management/types/PythonManagementFormData';
import {PythonManagementRequest} from '@waldur/ansible/python-management/types/PythonManagementRequest';

export const isVirtualEnvironmentNotEditable = (pythonManagement: PythonManagementFormData, index: number, timeout: number): boolean => {
  const virtualEnvironment = pythonManagement.virtualEnvironments[index];
  if (virtualEnvironment) {
    const virtualEnvironmentName = virtualEnvironment.name;
    if (pythonManagement.requests) {
      return pythonManagement.requests.some((r: PythonManagementRequest) =>
        PythonManagementRequest.isExecuting(r, timeout) && (PythonManagementRequest.isGlobalRequest(r) || r.virtualEnvironmentName === virtualEnvironmentName));
    }
  }
  return false;
};

export const existsExecutingGlobalRequest = (pythonManagement: PythonManagementFormData, timeout: number): boolean => {
  if (pythonManagement && pythonManagement.requests) {
    return pythonManagement.requests.some(r =>
      PythonManagementRequest.isExecuting(r, timeout) && PythonManagementRequest.isGlobalRequest(r));
  }
  return false;
};

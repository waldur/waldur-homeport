import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class PythonManagementFormData extends VirtualEnvAndRequestsContainer<PythonManagementRequest> {
  virtualEnvironmentsDirectory: string;
  instance: Instance;
  managementState: ManagementRequestState;
  pythonVersion: string;
  virtualEnvironments: VirtualEnvironment[] = [];
  requests: PythonManagementRequest[] = [];
  waldurPublicKeyInstalled: boolean;
  systemUser: string;

  getVirtualEnvironments = (formData: PythonManagementFormData): VirtualEnvironment[] => {
    return formData.virtualEnvironments;
  }

  getAllRequests = (formData: PythonManagementFormData): Array<ManagementRequest<any>> => {
    return formData.requests;
  }
}

import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';
import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { PythonManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/PythonManagementRequestStateTypePair';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class PythonManagementFormData extends VirtualEnvAndRequestsContainer<PythonManagementRequest, PythonManagementRequestStateTypePair> {
  virtualEnvironmentsDirectory: string;
  instance: Instance;
  requestsStateTypePairs: PythonManagementRequestStateTypePair[] = [];
  pythonVersion: string;
  virtualEnvironments: VirtualEnvironment[] = [];
  requests: PythonManagementRequest[] = [];
  waldurPublicKeyInstalled: boolean;
  systemUser: string;

  getVirtualEnvironments = (formData: PythonManagementFormData): VirtualEnvironment[] => {
    return formData.virtualEnvironments;
  }

  getAllRequests = (formData: PythonManagementFormData): Array<ManagementRequest<any, any>> => {
    return formData.requests;
  }
}

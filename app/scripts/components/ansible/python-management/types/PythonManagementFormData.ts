import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { PythonManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/PythonManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
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

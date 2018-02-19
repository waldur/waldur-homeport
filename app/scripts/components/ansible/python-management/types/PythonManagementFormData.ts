import {Instance} from '@waldur/ansible/python-management/types/Instance';
import {PythonManagementRequest} from '@waldur/ansible/python-management/types/PythonManagementRequest';
import {PythonManagementRequestStateTypePair} from '@waldur/ansible/python-management/types/PythonManagementRequestStateTypePair';
import {VirtualEnvironment} from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class PythonManagementFormData {
  uuid: string;
  virtualEnvironmentsDirectory: string;
  virtualEnvironments: VirtualEnvironment[] = [];
  instance: Instance;
  requestsStateTypePairs: PythonManagementRequestStateTypePair[] = [];
  requests: PythonManagementRequest[] = [];
  pythonVersion: string;
}

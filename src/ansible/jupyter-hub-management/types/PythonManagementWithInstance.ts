import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export class PythonManagementWithInstance {
  name: string;
  url: string;
  uuid: string;
  virtualEnvironmentsDirectory: string;
  virtualEnvironments: VirtualEnvironment[] = [];
  instance: Instance;
}

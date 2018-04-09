import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestsHolder } from '@waldur/ansible/python-management/types/ManagementRequestsHolder';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export abstract class VirtualEnvAndRequestsContainer<R extends ManagementRequest<R>>
  implements ManagementRequestsHolder<R> {
  uuid: string;
  pythonVersion: string = '3';
  abstract requests: Array<ManagementRequest<R>>;
  abstract getVirtualEnvironments: (formData: VirtualEnvAndRequestsContainer<R>) => VirtualEnvironment[];
  abstract getAllRequests: (formData: VirtualEnvAndRequestsContainer<R>) => Array<ManagementRequest<R>>;
}

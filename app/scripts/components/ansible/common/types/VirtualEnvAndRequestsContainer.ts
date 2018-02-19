import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { ManagementRequestsHolder } from '@waldur/ansible/common/types/ManagementRequestsHolder';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';

export abstract class VirtualEnvAndRequestsContainer<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>>
  implements ManagementRequestsHolder<R, RSP> {
  uuid: string;
  pythonVersion: string = '3';
  abstract requests: Array<ManagementRequest<R, RSP>>;
  abstract getVirtualEnvironments: (formData: VirtualEnvAndRequestsContainer<R, RSP>) => VirtualEnvironment[];
  abstract getAllRequests: (formData: VirtualEnvAndRequestsContainer<R, RSP>) => Array<ManagementRequest<R, RSP>>;
}

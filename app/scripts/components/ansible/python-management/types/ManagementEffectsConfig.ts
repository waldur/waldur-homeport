import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';

export class ManagementEffectsConfig<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  formName: string;
  loadRequestApiCall: any;
  requestBuilder: (serverPayload: any) => R;
  formDataBuilder: (serverPayload: any, instance?: any) => VirtualEnvAndRequestsContainer<R, RSP>;
}

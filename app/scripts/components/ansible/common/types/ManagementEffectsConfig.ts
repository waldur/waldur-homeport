import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';

export class ManagementEffectsConfig<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  formName: string;
  loadRequestApiCall: any;
  requestBuilder: (serverPayload: any) => R;
  formDataBuilder: (serverPayload: any, instance?: any) => VirtualEnvAndRequestsContainer<R, RSP>;
}

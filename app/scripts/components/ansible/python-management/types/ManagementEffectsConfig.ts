import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';

export class ManagementEffectsConfig<R extends ManagementRequest<R>> {
  formName: string;
  loadRequestApiCall: any;
  requestBuilder: (serverPayload: any) => R;
  formDataBuilder: (serverPayload: any, instance?: any) => VirtualEnvAndRequestsContainer<R>;
}

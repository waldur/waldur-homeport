import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';

export interface ManagementRequestsHolder<R extends ManagementRequest<R>> {
  requests: Array<ManagementRequest<R>>;
}

import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';

export interface ManagementRequestsHolder<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  requests: Array<ManagementRequest<R, RSP>>;
}

import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';

export interface ManagementRequestStateTypePair<R extends ManagementRequestStateTypePair<R>> {
  requestState: ManagementRequestState;

  buildReadableTooltip(request: R): string;
}

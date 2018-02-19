import { ManagementRequestState } from '@waldur/ansible/common/types/ManagementRequestState';

export interface ManagementRequestStateTypePair<R extends ManagementRequestStateTypePair<R>> {
  requestState: ManagementRequestState;

  buildReadableTooltip(request: R): string;
}

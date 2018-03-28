import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';

export abstract class ManagementRequest<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  uuid: string;
  requestState: ManagementRequestState;
  created: Date;
  virtualEnvironmentName: string;
  output: string;

  abstract toStateTypePair(request: R): RSP;
}

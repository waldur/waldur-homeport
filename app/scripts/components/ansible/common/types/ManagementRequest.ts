import { ManagementRequestState } from '@waldur/ansible/common/types/ManagementRequestState';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';

export abstract class ManagementRequest<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  uuid: string;
  requestState: ManagementRequestState;
  created: Date;
  virtualEnvironmentName: string;
  output: string;

  abstract toStateTypePair(request: R): RSP;
}

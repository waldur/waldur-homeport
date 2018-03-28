import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';

export abstract class ManagementRequest<R extends ManagementRequest<R>> {
  uuid: string;
  requestState: ManagementRequestState;
  created: Date;
  virtualEnvironmentName: string;
  output: string;

  abstract buildReadableTooltip(request: R): string;
}

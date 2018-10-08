import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';

export interface PythonManagementDetailsState {
  detailsPollingTask: number;
  unfoldedRequests: UnfoldedRequest[];
  waldurPublicKey: string;
  loaded: boolean;
  erred: boolean;
}

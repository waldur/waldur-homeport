import { UnfoldedRequest } from '@waldur/python-management/types/UnfoldedRequest';

export interface PythonManagementDetailsPayload {
  detailsPollingTask?: number;
  requestUuid?: string;
  unfoldedRequest?: UnfoldedRequest;
  waldurPublicKey?: string;
}

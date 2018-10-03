import { MANAGEMENT_REQUEST_STATE_TEXT_MAPPING } from '@waldur/ansible/python-management/state-builder/RequestStateReadableTextMappings';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { translate } from '@waldur/i18n';

export abstract class ManagementRequest<R extends ManagementRequest<R>> {
  uuid: string;
  requestState: ManagementRequestState;
  created: Date;
  virtualEnvironmentName: string;
  output: string;

  buildReadableTooltip(request: R): string {
    return `${translate(request.buildRequestTypeTooltip(request))} ${translate('request')} ${translate(MANAGEMENT_REQUEST_STATE_TEXT_MAPPING[request.requestState])}`;
  }

  abstract buildRequestTypeTooltip(request: R): string;
}

import { JUPYTER_REQUEST_TYPE_READABLE_TEXT_MAPPING } from '@waldur/ansible/common/state-builder/RequestStateReadableTextMappings';
import { ManagementRequestState } from '@waldur/ansible/common/types/ManagementRequestState';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import { translate } from '@waldur/i18n';

export class JupyterHubManagementRequestStateTypePair implements ManagementRequestStateTypePair<JupyterHubManagementRequestStateTypePair> {
  constructor(public requestState: ManagementRequestState, public requestType: JupyterHubManagementRequestType) {
  }

  buildReadableTooltip(request: JupyterHubManagementRequestStateTypePair): string {
    return translate(JUPYTER_REQUEST_TYPE_READABLE_TEXT_MAPPING[request.requestType]);
  }
}

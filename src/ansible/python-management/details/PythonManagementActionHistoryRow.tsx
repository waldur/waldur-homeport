import * as React from 'react';

import { RequestOutputRow } from '@waldur/ansible/python-management/details/RequestOutputRow';
import { buildStateIndicator } from '@waldur/ansible/python-management/state-builder/StateIndicatorBuilder';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

interface PythonManagementDetailsActionsHistoryRowProps<R extends ManagementRequest<R>> {
  request: R;
  triggerRequestOutputPollingTask: (request: R) => void;
  unfoldedRequests: UnfoldedRequest[];

  additionalInformationSectionBuilder(request: R);
}

export class PythonManagementActionHistoryRow<R extends ManagementRequest<R>>
  extends React.Component<PythonManagementDetailsActionsHistoryRowProps<R>> {

  render() {
    return (
      <>
        <tr onClick={() => this.props.triggerRequestOutputPollingTask(this.props.request)}
            style={{cursor: 'pointer'}}>
          <td>{this.props.request.buildRequestTypeTooltip(this.props.request)}</td>
          <td>
            <StateIndicator
              {...buildStateIndicator(
                this.props.request.requestState, this.props.request.buildReadableTooltip(this.props.request))}/>
          </td>
          <td>
            {this.props.request.virtualEnvironmentName ? this.props.request.virtualEnvironmentName : translate('Global request')}
          </td>
          <td>{formatDateTime(this.props.request.created)}</td>
        </tr>
        <RequestOutputRow
          request={this.props.request}
          unfoldedRequests={this.props.unfoldedRequests}
          additionalInformationSectionBuilder={this.props.additionalInformationSectionBuilder}/>
      </>
    );
  }
}

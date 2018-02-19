import * as React from 'react';

import { commonStateIndicatorBuilder } from '@waldur/ansible/common/state-builder/StateIndicatorBuilder';
import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { RequestOutputRow } from '@waldur/ansible/python-management/details/RequestOutputRow';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceStateIndicator } from '@waldur/resource/state/ResourceState';

interface PythonManagementDetailsActionsHistoryRowProps<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  request: R;
  triggerRequestOutputPollingTask: (request: R) => void;
  unfoldedRequests: UnfoldedRequest[];

  additionalInformationSectionBuilder(request: R);
}

export class PythonManagementActionHistoryRow<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>>
  extends React.Component<PythonManagementDetailsActionsHistoryRowProps<R, RSP>> {

  render() {
    const stateTypePair = this.props.request.toStateTypePair(this.props.request);
    return (
      <>
        <tr onClick={() => this.props.triggerRequestOutputPollingTask(this.props.request)}
            style={{cursor: 'pointer'}}>
          <td>{stateTypePair.buildReadableTooltip(stateTypePair)}</td>
          <td>
            <ResourceStateIndicator {...commonStateIndicatorBuilder.buildStateIndicator(stateTypePair)}/>
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

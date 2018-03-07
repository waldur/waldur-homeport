import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RequestOutputRow } from '@waldur/python-management/details/RequestOutputRow';
import {
  stateIndicatorBuilder,
  TYPE_READABLE_TEXT_MAPPING
} from '@waldur/python-management/form/StateIndicatorBuilder';
import { PythonManagementRequest } from '@waldur/python-management/types/PythonManagementRequest';
import { UnfoldedRequest } from '@waldur/python-management/types/UnfoldedRequest';
import { ResourceStateIndicator } from '@waldur/resource/state/ResourceState';

interface PythonManagementDetailsActionsHistoryRowProps {
  request: PythonManagementRequest;
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => void;
  unfoldedRequests: UnfoldedRequest[];
}

export const PythonManagementActionHistoryRow = (props: PythonManagementDetailsActionsHistoryRowProps) => {
  return (
    <>
      <tr onClick={() => props.triggerRequestOutputPollingTask(props.request)}
          style={{cursor: 'pointer'}}>
        <td>{translate(TYPE_READABLE_TEXT_MAPPING[props.request.requestType])}</td>
        <td>
          <ResourceStateIndicator {...stateIndicatorBuilder.buildStateIndicator(props.request)}/>
        </td>
        <td>
          {props.request.virtualEnvironmentName ? props.request.virtualEnvironmentName : translate('Global request')}
        </td>
        <td>{formatDateTime(props.request.created)}</td>
      </tr>
      <RequestOutputRow
        request={props.request}
        unfoldedRequests={props.unfoldedRequests}/>
    </>
  );
};

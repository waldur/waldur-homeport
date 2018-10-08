import * as React from 'react';

import { PythonManagementActionHistoryRow } from '@waldur/ansible/python-management/details/PythonManagementActionHistoryRow';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { translate } from '@waldur/i18n';

interface PythonManagementDetailsActionsHistoryProps<R extends ManagementRequest<R>> {
  requests: R[];
  triggerRequestOutputPollingTask: (request: R) => void;
  unfoldedRequests: UnfoldedRequest[];

  additionalInformationSectionBuilder(request: R);
}

export class PythonManagementActionsHistory<R extends ManagementRequest<R>>
  extends React.Component<PythonManagementDetailsActionsHistoryProps<R>> {

  render() {
    return (
      <div className="dataTables_wrapper">
        <table className="table table-striped dataTable">
          <thead>
          <tr>
            <th>{translate('Request type')}</th>
            <th>{translate('State')}</th>
            <th>{translate('Virtual environment')}</th>
            <th>{translate('Created')}</th>
          </tr>
          </thead>
          <tbody>
          {this.props.requests.map((request, index) => (
            <PythonManagementActionHistoryRow
              {...this.props}
              request={request}
              key={index}/>
          ))}
          </tbody>
        </table>
      </div>
    );
  }

}

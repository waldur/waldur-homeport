import * as React from 'react';

import { translate } from '@waldur/i18n';
import { PythonManagementActionHistoryRow } from '@waldur/python-management/details/PythonManagementActionHistoryRow';
import { PythonManagementFormData } from '@waldur/python-management/types/PythonManagementFormData';
import { PythonManagementRequest } from '@waldur/python-management/types/PythonManagementRequest';
import { UnfoldedRequest } from '@waldur/python-management/types/UnfoldedRequest';

interface PythonManagementDetailsActionsHistoryProps {
  pythonManagement: PythonManagementFormData;
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => void;
  unfoldedRequests: UnfoldedRequest[];
}

export const PythonManagementActionsHistory = (props: PythonManagementDetailsActionsHistoryProps) => {
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
        {props.pythonManagement.requests.map((request, index) => (
          <PythonManagementActionHistoryRow
            {...props}
            request={request}
            key={index}/>
        ))}
        </tbody>
      </table>
    </div>
  );
};

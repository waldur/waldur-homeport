import { existsExecutingGlobalRequest, } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import '@waldur/ansible/python-management/styles/AnsibleApplications.scss';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { translate } from '@waldur/i18n';
import * as React from 'react';

interface AddVirtualEnvironmentButtonProps<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  pythonManagement: VirtualEnvAndRequestsContainer<R, RSP>;
  managementRequestTimeout: number;
  addVirtualEnvironment: () => void;
}

export class AddVirtualEnvironmentButton<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>>
  extends React.Component<AddVirtualEnvironmentButtonProps<R, RSP>> {

  render() {
    return (
      <button type="button"
              className="btn btn-default btn-add-option"
              onClick={this.props.addVirtualEnvironment}
              disabled={existsExecutingGlobalRequest(this.props.pythonManagement, this.props.managementRequestTimeout)}>
        {translate('Add virtual environment')}
      </button>
    );
  }

}

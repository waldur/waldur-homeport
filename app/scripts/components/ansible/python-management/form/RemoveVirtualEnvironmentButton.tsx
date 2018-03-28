import {
  isVirtualEnvironmentNotEditable,
  VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { translate } from '@waldur/i18n';
import * as React from 'react';

interface RemoveVirtualEnvironmentButtonProps<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  pythonManagement: VirtualEnvAndRequestsContainer<R, RSP>;
  managementRequestTimeout: number;
  index: number;
  removeVirtualEnvironment: () => void;
}

export class RemoveVirtualEnvironmentButton<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>>
  extends React.Component<RemoveVirtualEnvironmentButtonProps<R, RSP>> {
  render() {
    return (
      <button
        type="button"
        title={translate('Remove virtual environment')}
        className="btn btn-danger"
        disabled={isVirtualEnvironmentNotEditable(new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), this.props.index, this.props.managementRequestTimeout)}
        onClick={this.props.removeVirtualEnvironment}>X
      </button>
    );
  }
}

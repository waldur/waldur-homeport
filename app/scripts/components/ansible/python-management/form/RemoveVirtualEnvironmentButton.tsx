import * as React from 'react';

import {
isVirtualEnvironmentNotEditable,
VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { translate } from '@waldur/i18n';

interface RemoveVirtualEnvironmentButtonProps<R extends ManagementRequest<R>> {
  pythonManagement: VirtualEnvAndRequestsContainer<R>;
  managementRequestTimeout: number;
  index: number;
  removeVirtualEnvironment: () => void;
}

export class RemoveVirtualEnvironmentButton<R extends ManagementRequest<R>>
  extends React.Component<RemoveVirtualEnvironmentButtonProps<R>> {
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

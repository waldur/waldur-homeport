import * as React from 'react';

import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';
import {
  isVirtualEnvironmentNotEditable,
  VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { translate } from '@waldur/i18n';

interface RemoveVirtualEnvironmentButtonProps<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  pythonManagement: VirtualEnvAndRequestsContainer<R, RSP>;
  managementRequestTimeout: number;
  index: number;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => void;
}

export class FindMissingLibrariesButton<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>>
  extends React.Component<RemoveVirtualEnvironmentButtonProps<R, RSP>> {

  render() {
    const getVirtualEnvironments = (formData: VirtualEnvAndRequestsContainer<R, RSP>) => formData.getVirtualEnvironments(formData);
    return (
      <button
        type="button"
        title={translate('Find missing installed libraries')}
        className="btn btn-default"
        disabled={!this.props.pythonManagement.uuid
        || !getVirtualEnvironments(this.props.pythonManagement)[this.props.index].uuid
        || isVirtualEnvironmentNotEditable(new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), this.props.index, this.props.managementRequestTimeout)}
        onClick={() => this.props.findInstalledLibsInVirtualEnvironment(
          this.props.pythonManagement.uuid, getVirtualEnvironments(this.props.pythonManagement)[this.props.index].name)}>
        {translate('Find missing installed libraries')}
      </button>
    );
  }
}

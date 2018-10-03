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
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => void;
}

export class FindMissingLibrariesButton<R extends ManagementRequest<R>>
  extends React.Component<RemoveVirtualEnvironmentButtonProps<R>> {

  render() {
    const getVirtualEnvironments = (formData: VirtualEnvAndRequestsContainer<R>) => formData.getVirtualEnvironments(formData);
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

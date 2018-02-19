import * as React from 'react';

import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';
import { existsExecutingGlobalRequest, } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { translate } from '@waldur/i18n';

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

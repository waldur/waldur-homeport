import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form/lib/FieldArray';

import { ManagementRequest } from '@waldur/ansible/common/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/common/types/VirtualEnvAndRequestsContainer';
import { InstalledLibraryRowForm } from '@waldur/ansible/python-management/form/InstalledLibraryRowForm';
import {
  isVirtualEnvironmentNotEditable,
  VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { translate } from '@waldur/i18n';

export interface InstalledPackagesProps<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  virtualEnvironmentIndex: number;
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: VirtualEnvAndRequestsContainer<R, RSP>;
  managementRequestTimeout: number;
  jupyterHubMode: boolean;
}

export class InstalledLibraries<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>>
  extends React.Component<InstalledPackagesProps<R, RSP> & WrappedFieldArrayProps<any>> {
  render() {
    return (
      <div>
        {this.props.fields.map((library, index) => (
          <InstalledLibraryRowForm {...this.props} library={library} libraryIndex={index} key={`lib_${index}`}/>
        ))}
        {!this.props.jupyterHubMode &&
        <div className="form-group row">
          <div className="col-xs-3">
            <button
              type="button"
              className="btn btn-default btn-add-option"
              disabled={isVirtualEnvironmentNotEditable(
                new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), this.props.virtualEnvironmentIndex, this.props.managementRequestTimeout)}
              onClick={() => this.props.fields.push({})}>
              {translate('Add library')}
            </button>
          </div>
        </div>
        }
      </div>
    );
  }
}

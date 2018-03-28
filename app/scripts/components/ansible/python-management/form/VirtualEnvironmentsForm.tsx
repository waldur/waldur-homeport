import * as React from 'react';
import { FieldArray } from 'redux-form';

import { VirtualEnvironmentComponent } from '@waldur/ansible/python-management/form/VirtualEnvironment';
import { existsExecutingGlobalRequest } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { translate } from '@waldur/i18n';

interface VirtualEnvironmentsFormProps<R extends ManagementRequest<R>> {
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: VirtualEnvAndRequestsContainer<R>;
  findVirtualEnvironments: (uuid: string) => void;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => void;
  managementRequestTimeout: number;
  jupyterHubMode: boolean;
  pathToVirtualEnvironments: string;
}

export class VirtualEnvironmentsForm<R extends ManagementRequest<R>>
  extends React.Component<VirtualEnvironmentsFormProps<R>> {
  render() {
    return (
      <div className="form-group">
        <label className="control-label col-sm-2">
          {this.props.jupyterHubMode ? translate('Jupyter kernels (Python virtual environments)') : translate('Virtual environments')}
        </label>
        {!this.props.jupyterHubMode &&
        <div className="row form-group">
          <div className="col-sm-2">
            <button
              type="button"
              title={translate('Find installed virtual environments & libraries')}
              className="btn btn-default"
              disabled={!this.props.pythonManagement
              || !this.props.pythonManagement.uuid
              || existsExecutingGlobalRequest(this.props.pythonManagement, this.props.managementRequestTimeout)}
              onClick={() => this.props.findVirtualEnvironments(this.props.pythonManagement.uuid)}>
              {translate('Find installed virtual environments & libraries')}
            </button>
          </div>
        </div>
        }
        <div className="col-sm-10">
          <FieldArray name={this.props.pathToVirtualEnvironments}
                      component={VirtualEnvironmentComponent} {...this.props}/>
        </div>
      </div>
    );
  }
}

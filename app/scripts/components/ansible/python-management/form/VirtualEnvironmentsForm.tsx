import * as React from 'react';
import { FieldArray } from 'redux-form';

import { VirtualEnvironmentComponent } from '@waldur/ansible/python-management/form/VirtualEnvironment';
import { existsExecutingGlobalRequest } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { translate } from '@waldur/i18n';

interface VirtualEnvironmentsFormProps {
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: PythonManagementFormData;
  findVirtualEnvironments: (uuid: string) => void;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => void;
  pythonManagementRequestTimeout: number;
}

export const VirtualEnvironmentsForm = (props: VirtualEnvironmentsFormProps) => (
  <div className="form-group">
    <label className="control-label col-sm-3">{translate('Virtual environments')}</label>
    <div className="row form-group">
      <div className="col-sm-3">
        <button
          type="button"
          title={translate('Find installed virtual environments & libraries')}
          className="btn btn-default"
          disabled={!props.pythonManagement
          || !props.pythonManagement.uuid
          || existsExecutingGlobalRequest(props.pythonManagement, props.pythonManagementRequestTimeout)}
          onClick={() => props.findVirtualEnvironments(props.pythonManagement.uuid)}>
          {translate('Find installed virtual environments & libraries')}
        </button>
      </div>
    </div>
    <div className="row">
      <div className="col-sm-3"/>
      <div className="col-sm-8">
        <FieldArray name="virtualEnvironments" component={VirtualEnvironmentComponent} {...props}/>
      </div>
    </div>
  </div>
);

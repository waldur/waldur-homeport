import * as React from 'react';
import { FieldArray } from 'redux-form';

import { JupyterHubUserRowsComponent } from '@waldur/ansible/jupyter-hub-management/form/JupyterHubUserRows';
import { JupyterHubUser } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUser';
import { JupyterHubUserAdminMode } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUserAdminMode';
import { JupyterHubUsersHolder } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUsersHolder';
import { translate } from '@waldur/i18n';

export interface JupyterHubUsersGroupProps {
  jupyterHubManagement: JupyterHubUsersHolder;
  managementRequestTimeout: number;
  label: string;
  passwordEnabled: boolean;
  whitelisting: boolean;
  adminCheckboxMode: JupyterHubUserAdminMode;
  pathToJupyterHubUsers: string;
  getJupyterHubUsers: (formData: JupyterHubUsersHolder) => JupyterHubUser[];
  isGlobalRequestRunning?: boolean;
}

export const JupyterHubUsersGroupForm = (props: JupyterHubUsersGroupProps) => (
  <div className="form-group">
    <label className="control-label col-sm-2">{translate(props.label)}</label>
    <div className="row">
      <div className="col-sm-5">
        <FieldArray name={props.pathToJupyterHubUsers} component={JupyterHubUserRowsComponent} {...props} />
      </div>
    </div>
  </div>
);

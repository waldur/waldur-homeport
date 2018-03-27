import * as React from 'react';
import { Field } from 'redux-form';
import { WrappedFieldArrayProps } from 'redux-form/lib/FieldArray';

import { JupyterHubUsersHolder } from '@waldur/ansible/common/types/JupyterHubUsersHolder';
import { JupyterHubUsersGroupProps } from '@waldur/ansible/jupyter-hub-management/form/JupyterHubUsersGroupForm';
import { JupyterHubOAuthType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthType';
import { JupyterHubUser } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUser';
import { JupyterHubUserAdminMode } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUserAdminMode';
import {
  isNotBlank,
  validateJupyterHubUserPassword,
  validateJupyterHubUserUsernameFormat
} from '@waldur/ansible/jupyter-hub-management/validation';
import { FieldError } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

interface JupyterHubUserRowsComponentProps extends JupyterHubUsersGroupProps, WrappedFieldArrayProps<any> {
}

export class JupyterHubUserRowsComponent extends React.Component<JupyterHubUserRowsComponentProps> {

  passwordValidation = (value, formData: JupyterHubUsersHolder) =>
    validateJupyterHubUserPassword(value, this.props.getJupyterHubUsers(formData).find(u => u.password === value))
  usernameValidation = (username, _) => isNotBlank(username)
    ? validateJupyterHubUserUsernameFormat(username)
    : translate('Username should be provided')

  addUser = () => {
    this.props.fields.push(
      new JupyterHubUser({
        admin: this.props.adminCheckboxMode === JupyterHubUserAdminMode.ONLY_ADMINS,
        whitelisted: this.props.whitelisting,
      }));
  }

  render() {
    return (
      <div>
        {this.props.fields.map((jupyterHubUser, index) => (
          <div key={`user_${index}`}>
            <div className="form-group row">
              <div className="col-xs-5">
                <Field
                  name={`${jupyterHubUser}.username`}
                  type="text"
                  placeholder={translate('Username')}
                  validate={this.usernameValidation}
                  disabled={this.props.isGlobalRequestRunning}
                  onChange={newValue => {
                    this.props.getJupyterHubUsers(this.props.jupyterHubManagement)[index].uuid = undefined;
                    this.props.getJupyterHubUsers(this.props.jupyterHubManagement)[index].username = newValue;
                    this.props.getJupyterHubUsers(this.props.jupyterHubManagement)[index].password = undefined;
                    if (this.props.whitelisting) {
                      this.props.jupyterHubManagement.authenticationConfig.whitelistAdmins = true;
                    }
                  }
                  }
                  component={renderField}
                />
                {this.props.jupyterHubManagement.authenticationConfig.jupyterHubOAuthConfig
                && this.props.jupyterHubManagement.authenticationConfig.jupyterHubOAuthConfig.type === JupyterHubOAuthType.AZURE &&
                <p className="help-block m-b-none text-muted">
                  {translate(
                    'Your Microsoft Account full username. It should not contain @domain.com part. ' +
                    'All spaces or dots should be replaced with underscores: firstname_lastname')}
                </p>}
              </div>
              {this.props.passwordEnabled &&
              <div className="col-xs-4">
                <Field
                  name={`${jupyterHubUser}.password`}
                  type="password"
                  placeholder={translate('Password')}
                  validate={this.passwordValidation}
                  disabled={this.props.isGlobalRequestRunning}
                  component={renderField}/>
              </div>
              }
              {this.props.adminCheckboxMode === JupyterHubUserAdminMode.ENABLED &&
              <>
                <div className="col-xs-1">
                  {translate('Admin rights')}
                </div>
                <div className="col-xs-1">
                  <Field name={`${jupyterHubUser}.admin`}
                         type="checkbox"
                         disabled={this.props.isGlobalRequestRunning}
                         component={renderField}/>
                </div>
              </>
              }
              <button
                type="button"
                title={translate('Remove JupyterHub user')}
                className="btn btn-default"
                disabled={this.props.isGlobalRequestRunning}
                onClick={() => this.props.fields.remove(index)}>X
              </button>

              {!this.props.getJupyterHubUsers(this.props.jupyterHubManagement)[index].uuid
              && this.props.getJupyterHubUsers(this.props.jupyterHubManagement)[index].username
                ?
                <i className="fa fa-exclamation-triangle"
                   title={translate('User has not yet been saved.')}/> : null}
            </div>
          </div>
        ))}
        <FieldError error={this.props.meta.error}/>
        <button type="button"
                className="btn btn-default btn-add-option"
                onClick={this.addUser}
                disabled={this.props.isGlobalRequestRunning}>
          {translate('Add user')}
        </button>
      </div>
    );
  }
}

const renderField = props => (
  <>
    <input {...props.input}
           type={props.type}
           placeholder={props.placeholder}
           disabled={props.disabled}
           className="form-control"/>
    <FieldError error={props.meta.error}/>
  </>
);

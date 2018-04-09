import * as React from 'react';

import { JupyterHubManagementCreateProps } from '@waldur/ansible/jupyter-hub-management/create/JupyterHubManagementCreateContainer';
import { JupyterHubUsersGroupForm } from '@waldur/ansible/jupyter-hub-management/form/JupyterHubUsersGroupForm';
import { JupyterOAuthForm } from '@waldur/ansible/jupyter-hub-management/form/JupyterOAuthForm';
import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubManagementFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementFormData';
import { JupyterHubUserAdminMode } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUserAdminMode';
import { validateSessionTimeoutHours } from '@waldur/ansible/jupyter-hub-management/validation';
import { VirtualEnvironmentsForm } from '@waldur/ansible/python-management/form/VirtualEnvironmentsForm';
import { FieldError, FormContainer, StringField, SubmitButton } from '@waldur/form-react';
import { ListField } from '@waldur/form-react/list-field/ListField';
import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { RadioButtonChoice, RadioButtonField } from '@waldur/form-react/RadioButtonField';
import { translate } from '@waldur/i18n';

export interface JupyterHubManagementCreateFormProps extends JupyterHubManagementCreateProps {
  pythonManagementListProperties: ListConfiguration;
}

export const authenticationMethodDescription = (
  <>
    {translate('Either manually define credentials or enable OAuth authentication.')}
    <span className="fa fa-info-circle"
          style={{marginLeft: '10px'}}
          title={translate('Each JupyterHub user is mapped to a corresponding system user. Appropriate system user will be created on a first login.')}/>
  </>
);

export class JupyterHubManagementCreateForm extends React.Component<JupyterHubManagementCreateFormProps> {
  render() {
    return (
      <div className="wrapper wrapper-content">
        <div className="ibox-content">
          <div className="row m-md">
            <div className="col-md-6">
              <div>
                <h2 className="no-margins">
                  {translate('Create JupyterHub management')}
                </h2>
              </div>
            </div>
          </div>
          <div className="ibox">
            <div className="ibox-content">
              <div className="row">
                <div className="col-md-12">
                  <form
                    onSubmit={this.props.handleSubmit(this.props.createJupyterHubManagement)}
                    className="form-horizontal">
                    <FormContainer
                      submitting={this.props.submitting}
                      labelClass="col-sm-2"
                      controlClass="col-sm-8">
                      <StringField
                        name="sessionTimeToLiveHours"
                        label={this.props.translate('Inactive notebook instance time to live')}
                        required={true}
                        validate={validateSessionTimeoutHours}
                        description={translate('Hours. Once notebook instance is not active for this time it is terminated')}/>
                      <ListField formFieldName={'selectedPythonManagement'}
                                 label={translate('Associated python management')}
                                 configuration={this.props.pythonManagementListProperties}/>
                      <VirtualEnvironmentsForm reduxFormChange={this.props.change}
                                               jupyterHubMode={true}
                                               pythonManagement={this.props.jupyterHubManagement}
                                               findVirtualEnvironments={_ => Promise.resolve()}
                                               findInstalledLibsInVirtualEnvironment={(_, __) => Promise.resolve()}
                                               managementRequestTimeout={0}
                                               pathToVirtualEnvironments={'selectedPythonManagement.virtualEnvironments'}/>
                      <RadioButtonField
                        name="authenticationConfig.authenticationMethod"
                        label={translate('Authentication method')}
                        description={authenticationMethodDescription}
                        choices={[
                          new RadioButtonChoice(JupyterHubAuthenticationMethod.LINUX_PAM, 'Linux PAM'),
                          new RadioButtonChoice(JupyterHubAuthenticationMethod.OAUTH, 'OAuth'),
                        ]}
                        required={true}/>

                      <JupyterOAuthForm submitting={this.props.submitting}
                                        jupyterHubManagement={this.props.jupyterHubManagement}
                                        managementRequestTimeout={0}/>
                      {this.props.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.LINUX_PAM &&
                      <JupyterHubUsersGroupForm
                        jupyterHubManagement={this.props.jupyterHubManagement}
                        managementRequestTimeout={0}
                        label={'JupyterHub Linux users'}
                        adminCheckboxMode={JupyterHubUserAdminMode.ENABLED}
                        passwordEnabled={true}
                        whitelisting={false}
                        pathToJupyterHubUsers={'authenticationConfig.jupyterHubLinuxUsers'}
                        getJupyterHubUsers={(formData: JupyterHubManagementFormData) => formData.authenticationConfig.jupyterHubLinuxUsers}/>
                      }
                    </FormContainer>
                    <div className="form-group">
                      <div className="col-sm-offset-2 col-sm-5">
                        <FieldError error={this.props.error}/>
                        <SubmitButton
                          submitting={this.props.submitting}
                          label={this.props.translate('Create')}
                        />
                        <button
                          type="button"
                          className="btn btn-default m-l-sm"
                          disabled={this.props.submitting}
                          onClick={this.props.gotoApplicationsList}>
                          {this.props.translate('Cancel')}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

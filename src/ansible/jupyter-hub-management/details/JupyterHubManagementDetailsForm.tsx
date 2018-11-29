import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { authenticationMethodDescription } from '@waldur/ansible/jupyter-hub-management/create/JupyterHubManagementForm';
import { JupyterHubManagementDetailsProps } from '@waldur/ansible/jupyter-hub-management/details/JupyterHubManagementDetailsContainer';
import { JupyterHubUsersGroupForm } from '@waldur/ansible/jupyter-hub-management/form/JupyterHubUsersGroupForm';
import { JupyterOAuthForm } from '@waldur/ansible/jupyter-hub-management/form/JupyterOAuthForm';
import { areJupyterConfigFieldsDisabled } from '@waldur/ansible/jupyter-hub-management/form/stateLogic';
import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubManagementDetailsFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementDetailsFormData';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubUserAdminMode } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUserAdminMode';
import { validateSessionTimeoutHours } from '@waldur/ansible/jupyter-hub-management/validation';
import { PythonManagementActionsHistory } from '@waldur/ansible/python-management/details/PythonManagementActionsHistory';
import { VirtualEnvironmentsForm } from '@waldur/ansible/python-management/form/VirtualEnvironmentsForm';
import { buildStateIndicator } from '@waldur/ansible/python-management/state-builder/StateIndicatorBuilder';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { FormContainer, StringField } from '@waldur/form-react';
import { RadioButtonChoice, RadioButtonField } from '@waldur/form-react/RadioButtonField';
import { translate } from '@waldur/i18n';

export class JupyterHubManagementDetailsForm extends React.Component<JupyterHubManagementDetailsProps> {
  render() {
    const buildRequestAdditionalInfo = (_: JupyterHubManagementRequest) => {
      return null;
    };
    const jupyterConfigFieldsDisabled = areJupyterConfigFieldsDisabled(this.props.jupyterHubManagement, this.props.managementRequestTimeout);
    return (
      <div className="wrapper wrapper-content">
        <div className="ibox-content">
          <div className="row m-md">
            <div className="col-md-6">
              <div>
                <h2 className="no-margins">
                  {translate('JupyterHub management details')}
                </h2>
              </div>
            </div>
          </div>
          <div className="ibox">
            <div className="ibox-content">
              <div className="row">
                <div className="col-md-12">
                  <form
                    onSubmit={this.props.handleSubmit(this.props.updateJupyterHubManagement)}
                    className="form-horizontal">
                    <FormContainer
                      submitting={this.props.submitting}
                      labelClass="col-sm-2"
                      controlClass="col-sm-8">
                      <div className="form-group">
                        <label className="control-label col-sm-2">{translate('State')}</label>
                        <div className="same-padding-as-control-label">
                          <StateIndicator {...buildStateIndicator(this.props.jupyterHubManagement.managementState)}/>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="control-label col-sm-2">{translate('URL')}</label>
                        <div className="same-padding-as-control-label">
                          {this.props.jupyterHubManagement.jupyterHubUrl
                            ? <a href={this.props.jupyterHubManagement.jupyterHubUrl} target="_blank">JupyterHub</a>
                            : translate('Virtual machine has no floating ips assigned!')}
                        </div>
                        <p className="help-block m-b-none text-muted col-sm-offset-2">
                          {translate('Virtual machine should have Web security group assigned')}
                        </p>
                      </div>
                      <div className="form-group">
                        <label className="control-label col-sm-2">{translate('JupyterHub runtime logs location')}</label>
                        <div className="same-padding-as-control-label">
                          /var/log/jupyterhub/jupyterhub.log
                        </div>
                      </div>
                      <StringField
                        name="sessionTimeToLiveHours"
                        label={this.props.translate('Inactive notebook instance time to live')}
                        required={true}
                        disabled={jupyterConfigFieldsDisabled}
                        validate={validateSessionTimeoutHours}
                        description={translate('Hours. Once notebook instance is not active for this time it is terminated')}/>
                      <div className="form-group">
                        <label className="control-label col-sm-2">{translate('Python Management')}</label>
                        <div className="same-padding-as-control-label">
                          <a
                            onClick={() => this.props.gotoPythonManagementDetails(this.props.jupyterHubManagement.selectedPythonManagement.uuid)}>
                            {this.props.jupyterHubManagement.selectedPythonManagement.name}
                          </a>
                        </div>
                      </div>
                      <VirtualEnvironmentsForm reduxFormChange={this.props.change}
                                               jupyterHubMode={true}
                                               pythonManagement={this.props.jupyterHubManagement}
                                               findVirtualEnvironments={_ => Promise.resolve()}
                                               findInstalledLibsInVirtualEnvironment={(_, __) => Promise.resolve()}
                                               managementRequestTimeout={this.props.managementRequestTimeout}
                                               pathToVirtualEnvironments={'virtualEnvironments'}/>
                      <RadioButtonField
                        name="authenticationConfig.authenticationMethod"
                        label={translate('Authentication method')}
                        description={authenticationMethodDescription}
                        disabled={true}
                        choices={[
                          new RadioButtonChoice(JupyterHubAuthenticationMethod.LINUX_PAM, 'Linux PAM'),
                          new RadioButtonChoice(JupyterHubAuthenticationMethod.OAUTH, 'OAuth'),
                        ]}/>
                      <JupyterOAuthForm submitting={this.props.submitting}
                                        isGlobalRequestRunning={areJupyterConfigFieldsDisabled(this.props.jupyterHubManagement, this.props.managementRequestTimeout)}
                                        jupyterHubManagement={this.props.jupyterHubManagement}
                                        managementRequestTimeout={0}/>
                      {this.props.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.LINUX_PAM &&
                      <JupyterHubUsersGroupForm
                        jupyterHubManagement={this.props.jupyterHubManagement}
                        managementRequestTimeout={this.props.managementRequestTimeout}
                        label={'JupyterHub Linux users'}
                        adminCheckboxMode={JupyterHubUserAdminMode.ENABLED}
                        passwordEnabled={true}
                        whitelisting={false}
                        isGlobalRequestRunning={areJupyterConfigFieldsDisabled(this.props.jupyterHubManagement, this.props.managementRequestTimeout)}
                        pathToJupyterHubUsers={'authenticationConfig.jupyterHubLinuxUsers'}
                        getJupyterHubUsers={(formData: JupyterHubManagementDetailsFormData) => formData.authenticationConfig.jupyterHubLinuxUsers}/>
                      }
                    </FormContainer>
                    <div className="form-group">
                      <div className="col-sm-offset-2">
                        <div className="col-sm-3">
                          <button type="submit"
                                  className="btn btn-btn-primary btn-xs">
                            <i className="fa fa-save"/>
                            {translate('Apply or rerun JupyterHub configuration')}
                          </button>
                        </div>
                        <div className="col-sm-3">
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            disabled={areJupyterConfigFieldsDisabled(this.props.jupyterHubManagement, this.props.managementRequestTimeout)}
                            onClick={() => this.props.deleteJupyterHubManagement(this.props.jupyterHubManagement)}>
                            <i className="fa fa-trash"/>
                            {translate('Delete JupyterHub & all its users with all their data')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="row">
                <dl className="dl-horizontal col-sm-12">
                  <div className="panel-body">
                    <div className="tabs-container m-l-sm">
                      <Tabs defaultActiveKey={1} id={'tabs'}>
                        <Tab eventKey={1} title="Actions history">
                          <PythonManagementActionsHistory
                            requests={this.props.jupyterHubManagement.requests}
                            triggerRequestOutputPollingTask={this.props.triggerJupyterHubRequestOutputPollingTask}
                            unfoldedRequests={this.props.unfoldedRequests}
                            additionalInformationSectionBuilder={buildRequestAdditionalInfo}/>
                        </Tab>
                      </Tabs>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

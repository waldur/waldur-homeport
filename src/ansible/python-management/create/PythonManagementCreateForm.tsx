import * as React from 'react';

import { PythonManagementCreateProps } from '@waldur/ansible/python-management/create/PythonManagementCreateContainer';
import { VirtualEnvironmentsForm } from '@waldur/ansible/python-management/form/VirtualEnvironmentsForm';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { validateVirtualEnvironmentDirectory } from '@waldur/ansible/python-management/validation';
import { FieldError, FormContainer, StringField, SubmitButton } from '@waldur/form-react';
import { CheckboxField } from '@waldur/form-react/CheckboxField';
import { ListField } from '@waldur/form-react/list-field/ListField';
import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { translate } from '@waldur/i18n';

export interface PythonManagementCreateFormProps extends PythonManagementCreateProps {
  instanceListProperties: ListConfiguration;
  pythonManagement: PythonManagementFormData;
}

export class PythonManagementCreateForm extends React.Component<PythonManagementCreateFormProps> {

  state = {
    publicKeyHelpCollaped: true,
  };

  unwrapOrCollapsePublicKeyHelp = () => {
    this.setState({publicKeyHelpCollaped: !this.state.publicKeyHelpCollaped});
  }

  render() {
    const systemUser = this.props.pythonManagement.systemUser
      ? this.props.pythonManagement.systemUser : 'TARGET_SYSTEM_USER';
    const selectedInstance = (this.props.pythonManagement as any).selectedInstance;
    const instanceExternalIp = selectedInstance && selectedInstance.floating_ips ? selectedInstance.floating_ips[0].address : 'VM_EXTERNAL_IP';
    const waldurPublicKeyHelp = (
      <ul>
        <li>
          {translate('Please assign \'SSH\' security group to the virtual machine (to allow SSH connections).')}
        </li>
        <li>
          {translate('Please add following public key to authorized_keys file on the selected instance.')}
          <br/>
          <a onClick={this.unwrapOrCollapsePublicKeyHelp}>Show key</a>
          {this.state.publicKeyHelpCollaped ? null :
            <ul>
              <li>{translate(`Connect to a virtual machine: ${instanceExternalIp}:22`)}</li>
              <li>{translate(`Ensure that the following public key is present in /home/${systemUser}/.ssh/authorized_keys file.`)}</li>
              <li>
                {translate('If not, append it there on a new line. If file is not present, create a new file with the key.')}
                <pre style={{whiteSpace: 'pre-wrap'}}>
                {this.props.waldurPublicKey}
              </pre>
              </li>
            </ul>
          }
        </li>
      </ul>
    );
    const virtualEnvironmentsDirectory = this.props.pythonManagement.virtualEnvironmentsDirectory
      ? this.props.pythonManagement.virtualEnvironmentsDirectory : 'VIRTUAL_ENVS_DIRECTORY';
    const virtualEnvironmentsDirectoryDescription = translate(
      'Directory will be created in home directory of the specified system user:'
      + '/home/' + systemUser + '/' + virtualEnvironmentsDirectory);
    return (
      <div className="wrapper wrapper-content">
        <div className="ibox-content">
          <div className="row m-md">
            <div className="col-md-6">
              <div>
                <h2 className="no-margins">
                  {translate('Create Python management')}
                </h2>
              </div>
            </div>
          </div>
          <div className="ibox">
            <div className="ibox-content">
              <div className="row">
                <div className="col-md-12">
                  <form
                    onSubmit={this.props.handleSubmit(this.props.createPythonManagement)}
                    className="form-horizontal">
                    <FormContainer
                      submitting={this.props.submitting}
                      labelClass="col-sm-2"
                      controlClass="col-sm-10">
                      <StringField
                        name="virtualEnvironmentsDirectory"
                        label={this.props.translate('Virtual environments directory')}
                        required={true}
                        description={virtualEnvironmentsDirectoryDescription}
                        validate={validateVirtualEnvironmentDirectory}/>
                      <ListField formFieldName={'selectedInstance'}
                                 label={translate('Virtual machine')}
                                 description={translate('Only distributions with APT package manager are supported (Debian, Ubuntu...)')}
                                 configuration={this.props.instanceListProperties}/>
                      <StringField
                        name="systemUser"
                        label={this.props.translate('System user')}
                        required={true}
                        description={translate('Any default system user (ubuntu, debian...). The user should be able to run commands as root')}/>
                      <VirtualEnvironmentsForm reduxFormChange={this.props.change}
                                               pythonManagement={this.props.pythonManagement}
                                               findVirtualEnvironments={_ => Promise.resolve()}
                                               findInstalledLibsInVirtualEnvironment={(_, __) => Promise.resolve()}
                                               managementRequestTimeout={0}
                                               jupyterHubMode={false}
                                               pathToVirtualEnvironments={'virtualEnvironments'}/>
                      <CheckboxField
                        name="waldurPublicKeyInstalled"
                        label={this.props.translate('Virtual machine contains a public key of the cloud broker')}
                        description={waldurPublicKeyHelp}
                        checked={this.props.pythonManagement.waldurPublicKeyInstalled === true}
                        required={true}/>
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

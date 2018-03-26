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
    const waldurPublicKeyHelp = (
      <ul>
        <li>
          Target virtual machine should have 'SSH' security group assigned (to allow SSH connections).
        </li>
        <li>
          Ensure that the following public key is present in authorized_keys file on the selected instance
          <br/>
          <a onClick={this.unwrapOrCollapsePublicKeyHelp}>Help</a>
          {this.state.publicKeyHelpCollaped ? null :
            <>
              <br/>
              Ensure that the following public key is present in /home/TARGET_SYSTEM_USER/.ssh/authorized_keys file.
              <br/>
              If not, append it there. If file is not present, create new file with the key.
              <pre style={{whiteSpace: 'pre-wrap'}}>
                {this.props.waldurPublicKey}
              </pre>
            </>
          }
        </li>
      </ul>
    );
    return (
      <div className="wrapper wrapper-content">
        <div className="ibox-content">
          <div className="row m-md">
            <div className="col-md-6">
              <div>
                <h2 className="no-margins">
                  {translate('Python management details')}
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
                      controlClass="col-sm-8">
                      <StringField
                        name="virtualEnvironmentsDirectory"
                        label={this.props.translate('Virtual environments directory')}
                        required={true}
                        description={translate('Directory will be created in home directory of default system user.')}
                        validate={validateVirtualEnvironmentDirectory}/>
                      <ListField formFieldName={'selectedInstance'}
                                 label={translate('Virtual machine')}
                                 description={translate('Only distributions with APT package manager are supported (Debian, Ubuntu...)')}
                                 configuration={this.props.instanceListProperties}/>
                      <StringField
                        name="systemUser"
                        label={this.props.translate('System user')}
                        required={true}
                        description={translate('Python virtual environments folder will be installed in the home folder of this user.')}/>
                      <VirtualEnvironmentsForm reduxFormChange={this.props.change}
                                               pythonManagement={this.props.pythonManagement}
                                               findVirtualEnvironments={_ => Promise.resolve()}
                                               findInstalledLibsInVirtualEnvironment={(_, __) => Promise.resolve()}
                                               managementRequestTimeout={0}
                                               jupyterHubMode={false}
                                               pathToVirtualEnvironments={'virtualEnvironments'}/>
                      <CheckboxField
                        name="waldurPublicKeyInstalled"
                        label={this.props.translate('Virtual machine has cloud broker public key')}
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

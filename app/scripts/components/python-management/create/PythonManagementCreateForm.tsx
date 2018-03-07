import * as React from 'react';

import { FieldError, FormContainer, StringField, SubmitButton } from '@waldur/form-react';
import { CheckboxField } from '@waldur/form-react/CheckboxField';
import { ListField } from '@waldur/form-react/list-field/ListField';
import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { translate } from '@waldur/i18n';
import { PythonManagementCreateProps } from '@waldur/python-management/create/PythonManagementCreateContainer';
import { VirtualEnvironmentsForm } from '@waldur/python-management/form/VirtualEnvironmentsForm';
import { PythonManagementFormData } from '@waldur/python-management/types/PythonManagementFormData';
import { validateVirtualEnvironmentDirectory } from '@waldur/python-management/utils';

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
      <>
        Ensure that the following public key is present in authorized_keys file on the selected instance
        <br/>
        <a onClick={this.unwrapOrCollapsePublicKeyHelp}>Help</a>
        {this.state.publicKeyHelpCollaped ? null :
          <>
            <br/>
            Ensure that the following public key is present in /home/SYSTEM_DEFAULT_USER/.ssh/authorized_keys file.
            <br/>
            If not, append it there. If file is not present, create new file with the key.
            <pre style={{whiteSpace: 'pre-wrap'}}>
              {this.props.waldurPublicKey}
            </pre>
          </>
        }
      </>
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
                <div className="col-md-9">
                  <form
                    onSubmit={this.props.handleSubmit(this.props.createPythonManagement)}
                    className="form-horizontal">
                    <FormContainer
                      submitting={this.props.submitting}
                      labelClass="col-sm-3"
                      controlClass="col-sm-5">
                      <StringField
                        name="virtualEnvironmentsDirectory"
                        label={this.props.translate('Virtual environments directory')}
                        required={true}
                        description={translate('Directory will be created in home directory of default system user.')}
                        validate={validateVirtualEnvironmentDirectory}/>
                      <ListField formFieldName={'selectedInstance'}
                                 label={translate('Virtual machine')}
                                 configuration={this.props.instanceListProperties}/>
                      <VirtualEnvironmentsForm reduxFormChange={this.props.change}
                                               pythonManagement={this.props.pythonManagement}
                                               findVirtualEnvironments={_ => Promise.resolve()}
                                               findInstalledLibsInVirtualEnvironment={(_, __) => Promise.resolve()}
                                               pythonManagementRequestTimeout={0}/>
                      <CheckboxField
                        name="waldurPublicKeyInstalled"
                        label={this.props.translate('Virtual machine has cloud broker public key')}
                        description={waldurPublicKeyHelp}
                        required={true}/>
                    </FormContainer>
                    <div className="form-group">
                      <div className="col-sm-offset-3 col-sm-5">
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

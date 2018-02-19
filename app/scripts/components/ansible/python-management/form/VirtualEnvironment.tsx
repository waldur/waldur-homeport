import * as classNames from 'classnames';
import * as React from 'react';
import { Field, FieldArray } from 'redux-form';
import { WrappedFieldArrayProps } from 'redux-form/lib/FieldArray';

import { AddVirtualEnvironmentButton } from '@waldur/ansible/python-management/form/AddVirtualEnvironmentButton';
import { FindMissingLibrariesButton } from '@waldur/ansible/python-management/form/FindMissingLibrariesButton';
import { installedPackages } from '@waldur/ansible/python-management/form/InstalledPackagesForm';
import { RemoveVirtualEnvironmentButton } from '@waldur/ansible/python-management/form/RemoveVirtualEnvironmentButton';
import { isVirtualEnvironmentNotEditable } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { validateVirtualEnvironmentDirectory } from '@waldur/ansible/python-management/utils';
import { FieldError } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

interface VirtualEnvironmentProps extends WrappedFieldArrayProps<any> {
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: PythonManagementFormData;
  findVirtualEnvironments: (uuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
  pythonManagementRequestTimeout: number;
}

export class VirtualEnvironmentComponent extends React.Component<VirtualEnvironmentProps> {

  state = {
    expandedVirtualEnvironments: [],
  };

  collapseOrExpandVirtualEnv = (index: number) => {
    const expandedVirEnvsCopy = this.state.expandedVirtualEnvironments.slice();
    const position = expandedVirEnvsCopy.indexOf(index);
    if (position > -1) {
      expandedVirEnvsCopy.splice(position, 1);
    } else {
      expandedVirEnvsCopy.push(index);
    }
    this.setState({expandedVirtualEnvironments: expandedVirEnvsCopy});
  }

  isVirtualEnvExpanded = (index: number) => {
    return this.state.expandedVirtualEnvironments.indexOf(index) > -1;
  }

  addVirtualEnvironment = () => {
    const expandedVirEnvsCopy = this.state.expandedVirtualEnvironments.slice();
    expandedVirEnvsCopy.push(this.props.fields.length);
    this.props.fields.push({});
    this.setState({
      expandedVirtualEnvironments: expandedVirEnvsCopy,
    });
  }

  render() {
    const chevronClass = index => classNames({
      'fa': true,
      'fa-chevron-down': this.isVirtualEnvExpanded(index),
      'fa-chevron-up': !this.isVirtualEnvExpanded(index),
    });
    return (
      <div>
        {this.props.fields.map((virtualEnvironment, index) => (
          <div key={`virEnv_${index}`}>
            <div className="form-group row">
              <hr/>
              <div className="col-xs-5">
                <Field
                  name={`${virtualEnvironment}.name`}
                  type="text"
                  placeholder={translate('Virtual environment name')}
                  required={true}
                  disabled={isVirtualEnvironmentNotEditable(this.props.pythonManagement, index, this.props.pythonManagementRequestTimeout)}
                  component={renderField}
                  validate={validateVirtualEnvironmentDirectory}
                />
              </div>

              <RemoveVirtualEnvironmentButton
                index={index}
                pythonManagement={this.props.pythonManagement}
                pythonManagementRequestTimeout={this.props.pythonManagementRequestTimeout}
                removeVirtualEnvironment={() => this.props.fields.remove(index)}/>
              <FindMissingLibrariesButton
                index={index}
                pythonManagement={this.props.pythonManagement}
                pythonManagementRequestTimeout={this.props.pythonManagementRequestTimeout}
                findInstalledLibsInVirtualEnvironment={this.props.findInstalledLibsInVirtualEnvironment}/>

              {!this.props.pythonManagement.virtualEnvironments[index].uuid
              && this.props.pythonManagement.virtualEnvironments[index].name
                ?
                <span className="fas fa-exclamation-triangle"
                      title={translate('Virtual environment has not yet been saved.')}/> : null}

              <a className="collapse-link" style={{marginLeft: '10px'}}
                 onClick={() => this.collapseOrExpandVirtualEnv(index)}>
                <i className={chevronClass(index)}/>
              </a>
            </div>
            <div className={this.isVirtualEnvExpanded(index) ? null : 'collapse'}>
              <FieldArray name={`${virtualEnvironment}.installedLibraries`}
                          component={installedPackages}
                          props={{
                            virtualEnvironmentIndex: index,
                            reduxFormChange: this.props.reduxFormChange,
                            pythonManagement: this.props.pythonManagement,
                            pythonManagementRequestTimeout: this.props.pythonManagementRequestTimeout,
                          }}
              />
            </div>
          </div>
        ))}
        <AddVirtualEnvironmentButton
          pythonManagement={this.props.pythonManagement}
          pythonManagementRequestTimeout={this.props.pythonManagementRequestTimeout}
          addVirtualEnvironment={this.addVirtualEnvironment}/>
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

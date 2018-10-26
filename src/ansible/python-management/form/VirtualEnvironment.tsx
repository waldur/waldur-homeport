import * as classNames from 'classnames';
import FileSaver from 'file-saver';
import * as React from 'react';
import { Field, FieldArray } from 'redux-form';
import { WrappedFieldArrayProps } from 'redux-form/lib/FieldArray';

import { AddVirtualEnvironmentButton } from '@waldur/ansible/python-management/form/AddVirtualEnvironmentButton';
import { FindMissingLibrariesButton } from '@waldur/ansible/python-management/form/FindMissingLibrariesButton';
import { InstalledLibraries } from '@waldur/ansible/python-management/form/InstalledLibrariesForm';
import { RemoveVirtualEnvironmentButton } from '@waldur/ansible/python-management/form/RemoveVirtualEnvironmentButton';
import {
isVirtualEnvironmentNotEditable,
VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { Library } from '@waldur/ansible/python-management/types/Library';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { VirtualEnvAndRequestsContainer } from '@waldur/ansible/python-management/types/VirtualEnvAndRequestsContainer';
import { VirtualEnvironment } from '@waldur/ansible/python-management/types/VirtualEnvironment';
import { validateVirtualEnvironmentDirectory } from '@waldur/ansible/python-management/validation';
import { FieldError, FileUploadField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

interface VirtualEnvironmentProps<R extends ManagementRequest<R>> extends WrappedFieldArrayProps<any> {
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: VirtualEnvAndRequestsContainer<R>;
  findVirtualEnvironments: (uuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
  managementRequestTimeout: number;
  jupyterHubMode: boolean;
  pathToVirtualEnvironments: string;
}

export class VirtualEnvironmentComponent<R extends ManagementRequest<R>>
  extends React.Component<VirtualEnvironmentProps<R>> {

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

  getVirtualEnvironments = (formData: VirtualEnvAndRequestsContainer<R>) => {
    return formData.getVirtualEnvironments(formData);
  }

  downloadRequirementsFile = (index: number) => {
    const virtualEnvironment = this.getVirtualEnvironments(this.props.pythonManagement)[index];
    const blob = new Blob([this.buildRequirementsFile(virtualEnvironment)], {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(blob, 'requirements_' + virtualEnvironment.name + '.txt');
  }

  areNoInstalledLibraries = (index: number) => {
    const installedLibraries = this.getVirtualEnvironments(this.props.pythonManagement)[index].installedLibraries;
    return installedLibraries && installedLibraries.length > 0;
  }

  buildRequirementsFile = (virtualEnvironment: VirtualEnvironment) => {
    return virtualEnvironment.installedLibraries.map(lib => lib.name.value + '==' + lib.version.value).join('\n');
  }

  buildOnRequirementsFileSelectedCallback = (index: number) => {
    return (_: any, uploadedFile: any) => {
      if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = __ => {
          this.handleOnFileLoaded(index, reader);
        };
        reader.readAsText(uploadedFile);
      }
    };
  }

  handleOnFileLoaded = (index: number, reader: FileReader) => {
    const installedLibraries = this.getVirtualEnvironments(this.props.pythonManagement)[index].installedLibraries;
    const installedLibrariesCopy = installedLibraries ? installedLibraries.slice() : [];
    (reader.result instanceof String ? reader.result.split('\n') : [])
      .forEach((libraryRow: string) => {
        const nameVersionParts = libraryRow.split('==');
        if (nameVersionParts[0]) {
          const library = new Library(nameVersionParts[0], nameVersionParts[1]);
          const existingLibraryIndex = this.findLibraryIndex(installedLibrariesCopy, library);
          if (existingLibraryIndex !== -1) {
            installedLibrariesCopy[existingLibraryIndex] = library;
          } else {
            installedLibrariesCopy.push(library);
          }
        }
      });
    this.props.reduxFormChange(`virtualEnvironments[${index}].installedLibraries`, installedLibrariesCopy);
  }

  findLibraryIndex = (libraries: Library[], library: Library) => {
    return libraries.findIndex(lib => lib.name.value === library.name.value);
  }

  render() {
    const chevronClass = index => classNames({
      'fa': true,
      'fa-chevron-down': this.isVirtualEnvExpanded(index),
      'fa-chevron-up': !this.isVirtualEnvExpanded(index),
    });
    const uploadRequirementsWidget = index => fieldProps => (
      <FileUploadField
        {...fieldProps}
        accept="text/plain"
        buttonLabel={translate('Upload Requirements.txt')}
        required={true}
        disabled={isVirtualEnvironmentNotEditable(new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), index, this.props.managementRequestTimeout)}
      />
    );
    return (
      <div>
        {this.props.fields.map((virtualEnvironment, index) => (
          <div key={`virEnv_${index}`}>
            <div className="form-group row">
              <hr/>
              <div className="col-xs-2">
                <Field
                  name={`${virtualEnvironment}.name`}
                  type="text"
                  placeholder={translate('Virtual environment name')}
                  required={true}
                  disabled={this.props.jupyterHubMode
                  || isVirtualEnvironmentNotEditable(new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), index, this.props.managementRequestTimeout)}
                  component={renderField}
                  validate={validateVirtualEnvironmentDirectory}
                />
              </div>

              {!this.props.jupyterHubMode &&
              <>
                <div className="col-xs-1">
                  <RemoveVirtualEnvironmentButton
                    index={index}
                    pythonManagement={this.props.pythonManagement}
                    managementRequestTimeout={this.props.managementRequestTimeout}
                    removeVirtualEnvironment={() => this.props.fields.remove(index)}/>
                </div>
                <div className="col-xs-3">
                  <FindMissingLibrariesButton
                    index={index}
                    pythonManagement={this.props.pythonManagement}
                    managementRequestTimeout={this.props.managementRequestTimeout}
                    findInstalledLibsInVirtualEnvironment={this.props.findInstalledLibsInVirtualEnvironment}/>
                </div>
              </>
              }
              {this.props.jupyterHubMode &&
              <>
                <div className="col-xs-1 same-padding-as-control-label">
                  {translate('Available as Jupyter kernel?')}
                </div>
                <div className="col-xs-1">
                  <Field name={`${virtualEnvironment}.jupyterHubGlobal`}
                         type="checkbox"
                         disabled={isVirtualEnvironmentNotEditable(
                           new VirtualEnvironmentNotEditableDs(this.props.pythonManagement),
                           index,
                           this.props.managementRequestTimeout)}
                         component={renderField}/>
                </div>
              </>
              }
              {!this.props.jupyterHubMode &&
              <>
                {this.areNoInstalledLibraries(index) &&
                <div className="col-xs-2 same-padding-as-control-label">
                  <a onClick={() => this.downloadRequirementsFile(index)}>Download requirements.txt</a>
                </div>
                }
                <div className="col-xs-3">
                  <Field
                    name={`${virtualEnvironment}.requirements`}
                    onChange={this.buildOnRequirementsFileSelectedCallback(index) as any}
                    component={uploadRequirementsWidget(index)}
                  />
                </div>
              </>
              }
              <div className="col-xs-1">
                {!this.getVirtualEnvironments(this.props.pythonManagement)[index].uuid
                && this.getVirtualEnvironments(this.props.pythonManagement)[index].name
                  ? <span className="fa fa-exclamation-triangle"
                          title={translate('Virtual environment has not yet been saved.')}/>
                  : null}
                <a className="collapse-link" style={{marginLeft: '10px'}}
                   onClick={() => this.collapseOrExpandVirtualEnv(index)}>
                  <i className={chevronClass(index)}/>
                </a>
              </div>
            </div>
            {this.isVirtualEnvExpanded(index) &&
            <FieldArray name={`${virtualEnvironment}.installedLibraries`}
                        component={InstalledLibraries}
                        props={{
                          virtualEnvironmentIndex: index,
                          reduxFormChange: this.props.reduxFormChange,
                          pythonManagement: this.props.pythonManagement,
                          managementRequestTimeout: this.props.managementRequestTimeout,
                          jupyterHubMode: this.props.jupyterHubMode,
                        }}
            />
            }
          </div>
        ))}
        {!this.props.jupyterHubMode &&
        <AddVirtualEnvironmentButton
          pythonManagement={this.props.pythonManagement}
          managementRequestTimeout={this.props.managementRequestTimeout}
          addVirtualEnvironment={this.addVirtualEnvironment}/>
        }
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

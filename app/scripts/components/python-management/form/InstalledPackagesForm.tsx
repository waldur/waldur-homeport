import * as React from 'react';
import { AsyncCreatable } from 'react-select';
import { Field } from 'redux-form';
import { WrappedFieldArrayProps } from 'redux-form/lib/FieldArray';

import { AutosuggestField } from '@waldur/form-react/autosuggest-field/AutosuggestField';
import { OptionDs } from '@waldur/form-react/autosuggest-field/OptionDs';
import { translate } from '@waldur/i18n';
import { autocompleteLibraryName, findLibraryVersions } from '@waldur/python-management/api';
import { isVirtualEnvironmentNotEditable } from '@waldur/python-management/form/VirtualEnvironmentUtils';
import { Library } from '@waldur/python-management/types/Library';
import { PythonManagementFormData } from '@waldur/python-management/types/PythonManagementFormData';

interface InstalledPackagesProps {
  virtualEnvironmentIndex: number;
  reduxFormChange: (field: string, value: any) => void;
  pythonManagement: PythonManagementFormData;
  pythonManagementRequestTimeout: number;
}

export const installedPackages = (props: InstalledPackagesProps & WrappedFieldArrayProps<any>) => (
  <div>
    {props.fields.map((library, index) => (
      <InstalledPackage {...props} library={library} libraryIndex={index} key={`lib_${index}`}/>
    ))}
    <div className="form-group row">
      <div className="col-xs-3">
        <button
          type="button"
          className="btn btn-default btn-add-option"
          disabled={isVirtualEnvironmentNotEditable(props.pythonManagement, props.virtualEnvironmentIndex, props.pythonManagementRequestTimeout)}
          onClick={() => props.fields.push({})}>
          {translate('Add library')}
        </button>
      </div>
    </div>
  </div>
);

interface InstalledPackageProps extends InstalledPackagesProps, WrappedFieldArrayProps<any> {
  libraryIndex: number;
  library: any;
}

class InstalledPackage extends React.Component<InstalledPackageProps> {

  state = {
    libraryVersions: [],
    versionsFetched: false,
    pythonVersion: this.props.pythonManagement.pythonVersion ? this.props.pythonManagement.pythonVersion : '3',
  };

  onSuggestionsFetchRequested = (value: string, callback: any) => {
    if (value && value.length > 2) {
      autocompleteLibraryName(value)
        .then((suggestedNamesPayload: any) =>
          callback(null, {options: this.buildLibrariesNames(suggestedNamesPayload.data)}));
    } else {
      callback(null, {options: []});
    }
  }

  initializeOptionsIfNeeded = () => {
    if (!this.state.versionsFetched) {
      const libraryName = this.props.pythonManagement.virtualEnvironments[this.props.virtualEnvironmentIndex].installedLibraries[this.props.libraryIndex].name;
      if (libraryName) {
        findLibraryVersions(libraryName.value, this.state.pythonVersion)
          .then((suggestedNamesPayload: any) =>
            this.setState({
              versionsFetched: true,
              libraryVersions: this.buildLibrariesVersions(suggestedNamesPayload.data.versions),
            })
          );
      }
    }
  }

  onOptionSelected = (option: OptionDs) => {
    this.setState({versionsFetched: false});
    if (option && option.value) {
      findLibraryVersions(option.value, this.state.pythonVersion)
        .then((suggestedLibraryVersionsPayload: any) =>
          this.setState({
            versionsFetched: true,
            libraryVersions: this.buildLibrariesVersions(suggestedLibraryVersionsPayload.data.versions),
          })
        );
    } else {
      this.setState({libraryVersions: []});
      this.props.reduxFormChange(`virtualEnvironments[${this.props.virtualEnvironmentIndex}]installedLibraries[${this.props.libraryIndex}].version`, null);
    }
  }

  isLibraryRequiresSaving = () => {
    const library = this.getSelectedLibrary();
    return library.name && library.name.value && library.version && library.version.value && !library.uuid;
  }

  buildLibrariesNames = (libraries: any[]) => {
    return libraries.map(lib => {
      return {value: lib.name, label: lib.name};
    });
  }

  buildLibrariesVersions = (libraries: string[]) => {
    return libraries.map(lib => {
      return {value: lib, label: lib};
    });
  }

  getSelectedLibrary = (): Library => {
    return this.props.pythonManagement
      .virtualEnvironments[this.props.virtualEnvironmentIndex]
      .installedLibraries[this.props.libraryIndex];
  }

  isLibraryNameSelected = () => {
    const selectedLibrary = this.getSelectedLibrary();
    return selectedLibrary && selectedLibrary.name && selectedLibrary.name.value;
  }

  render() {
    return (
      <div className="form-group row">
        <div className="col-xs-4">
          <AutosuggestField
            id={`virtual_env_${this.props.virtualEnvironmentIndex}_lib_name_${this.props.libraryIndex}`}
            formFieldName={`${this.props.library}.name`}
            placeholder={translate('Library name')}
            required={true}
            disabled={isVirtualEnvironmentNotEditable(this.props.pythonManagement, this.props.virtualEnvironmentIndex, this.props.pythonManagementRequestTimeout)}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onOptionSelected={this.onOptionSelected}
          />
        </div>
        <div className="col-xs-1 same-padding-as-control-label">
          {this.isLibraryNameSelected() ?
            <a href={'https://pypi.python.org/pypi/' + this.getSelectedLibrary().name.value} target="_blank">
              <span className="glyphicon glyphicon-link"/>
            </a>
            : null}
        </div>
        <div className="col-xs-3">
          <Field
            name={`${this.props.library}.version`}
            placeholder={translate('Library version')}
            required={true}
            component={fieldProps =>
              <AsyncCreatable
                {...fieldProps.input}
                value={fieldProps.input.value}
                disabled={isVirtualEnvironmentNotEditable(
                  this.props.pythonManagement, this.props.virtualEnvironmentIndex, this.props.pythonManagementRequestTimeout)}
                onChange={value => fieldProps.input.onChange(value)}
                options={this.state.libraryVersions}
                onFocus={(_: any) => this.initializeOptionsIfNeeded()}
                loadOptions={(_, callback: any) => {
                  callback(null, {options: this.state.libraryVersions});
                }}
              />
            }/>
        </div>
        <button
          type="button"
          title={translate('Remove package')}
          className="btn btn-default"
          disabled={isVirtualEnvironmentNotEditable(
            this.props.pythonManagement, this.props.virtualEnvironmentIndex, this.props.pythonManagementRequestTimeout)}
          onClick={() => this.props.fields.remove(this.props.libraryIndex)}>X
        </button>
        {this.isLibraryRequiresSaving()
          ? <span className="glyphicon glyphicon-warning-sign" title="Library has not yet been saved."/> : null}
      </div>
    );
  }
}

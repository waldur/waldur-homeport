import * as React from 'react';
import { AsyncCreatable } from 'react-select';
import { Field } from 'redux-form';
import { WrappedFieldArrayProps } from 'redux-form/lib/FieldArray';

import { autocompleteLibraryName, findLibraryVersions } from '@waldur/ansible/python-management/api';
import { InstalledPackagesProps } from '@waldur/ansible/python-management/form/InstalledLibrariesForm';
import {
isVirtualEnvironmentNotEditable,
VirtualEnvironmentNotEditableDs
} from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { Library } from '@waldur/ansible/python-management/types/Library';
import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { isBlank } from '@waldur/ansible/python-management/validation';
import { FieldError } from '@waldur/form-react';
import { AutosuggestField } from '@waldur/form-react/autosuggest-field/AutosuggestField';
import { OptionDs } from '@waldur/form-react/autosuggest-field/OptionDs';
import { translate } from '@waldur/i18n';

interface InstalledPackageProps<R extends ManagementRequest<R>>
  extends InstalledPackagesProps<R>, WrappedFieldArrayProps<any> {
  libraryIndex: number;
  library: any;
}

const isLibrarySelected = (value: OptionDs) => isValueSelected(value, translate('Please select a library'));
const isLibraryVersionSelected = (value: OptionDs) => isValueSelected(value, translate('Please select a version'));
const isValueSelected = (value: OptionDs, message: string) => !value || isBlank(value.value) ? message : undefined;

export class InstalledLibraryRowForm<R extends ManagementRequest<R>>
  extends React.Component<InstalledPackageProps<R>> {

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
      const libraryName =
        this.props.pythonManagement.getVirtualEnvironments(this.props.pythonManagement)[this.props.virtualEnvironmentIndex]
          .installedLibraries[this.props.libraryIndex].name;
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
      this.props.reduxFormChange(`virtualEnvironments[${this.props.virtualEnvironmentIndex}].installedLibraries[${this.props.libraryIndex}].version`, null);
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
      .getVirtualEnvironments(this.props.pythonManagement)[this.props.virtualEnvironmentIndex]
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
            disabled={this.props.jupyterHubMode
            || isVirtualEnvironmentNotEditable(
              new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), this.props.virtualEnvironmentIndex, this.props.managementRequestTimeout)}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onOptionSelected={this.onOptionSelected}
            validate={isLibrarySelected}
          />
        </div>
        <div className="col-xs-1 same-padding-as-control-label">
          {this.isLibraryNameSelected() ?
            <a href={'https://pypi.python.org/pypi/' + this.getSelectedLibrary().name.value} target="_blank">
              <span className="fa fa-external-link"/>
            </a>
            : null}
        </div>
        <div className="col-xs-3">
          <Field
            name={`${this.props.library}.version`}
            placeholder={translate('Library version')}
            required={true}
            validate={isLibraryVersionSelected}
            component={fieldProps =>
              <>
                <AsyncCreatable
                  {...fieldProps.input}
                  value={fieldProps.input.value}
                  disabled={this.props.jupyterHubMode
                  || isVirtualEnvironmentNotEditable(
                    new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), this.props.virtualEnvironmentIndex, this.props.managementRequestTimeout)}
                  onChange={value => fieldProps.input.onChange(value)}
                  options={this.state.libraryVersions}
                  onFocus={(_: any) => this.initializeOptionsIfNeeded()}
                  onBlur={() => fieldProps.input.onBlur(this.getSelectedLibrary().version)}
                  loadOptions={(_, callback: any) => {
                    callback(null, {options: this.state.libraryVersions});
                  }}
                />
                <FieldError error={fieldProps.meta.error}/>
              </>
            }/>
        </div>
        {!this.props.jupyterHubMode &&
        <>
          <button
            type="button"
            title={translate('Remove package')}
            className="btn btn-danger"
            disabled={isVirtualEnvironmentNotEditable(
              new VirtualEnvironmentNotEditableDs(this.props.pythonManagement), this.props.virtualEnvironmentIndex, this.props.managementRequestTimeout)}
            onClick={() => this.props.fields.remove(this.props.libraryIndex)}>X
          </button>
          {this.isLibraryRequiresSaving()
            ? <span className="fa fa-exclamation-triangle" title={translate('Library has not yet been saved')}/> : null}
        </>
        }
      </div>
    );
  }
}

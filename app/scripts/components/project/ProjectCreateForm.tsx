import * as React from 'react';

import {
  StringField,
  TextField,
  SelectField,
  FormContainer,
  FieldError,
  SubmitButton
} from '@waldur/form-react';

const validateProjectName = (value, _, props) =>
  props.customer.projects.find(project => project.name === value) ?
  props.translate('Name is duplicated. Choose other name.') :
  undefined;

export const ProjectCreateForm = props => (
  <form
    onSubmit={props.handleSubmit(props.createProject)}
    className="form-horizontal">
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-5">
      <StringField
        label={props.translate('Project name')}
        name="name"
        description={props.translate('This name will be visible in accounting data.')}
        required={true}
        validate={validateProjectName}
      />
      <TextField
        label={props.translate('Project description')}
        name="description"
      />
      {props.projectTypes.length >= 1 && (
        <SelectField
          label={props.translate('Project type')}
          name="type"
          options={props.projectTypes}
          labelKey="name"
          valueKey="url"
        />
      )}
      {props.certifications.length >= 1 && (
        <SelectField
          label={props.translate('Certifications')}
          name="certifications"
          description={props.translate('Provider certification required by this project.')}
          placeholder={props.translate('Select certifications')}
          options={props.certifications}
          labelKey="name"
          valueKey="url"
          multi={true}
        />
      )}
    </FormContainer>
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-5">
        <FieldError error={props.error}/>
        <SubmitButton
          submitting={props.submitting}
          label={props.translate('Add project')}
        />
        <button
          type="button"
          className="btn btn-default m-l-sm"
          onClick={props.gotoProjectList}>
          {props.translate('Cancel')}
        </button>
      </div>
    </div>
  </form>
);

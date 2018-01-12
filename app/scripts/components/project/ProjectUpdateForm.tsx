import * as React from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { TextField, FormContainer, FieldError, SubmitButton } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';

import { ProjectNameField } from './ProjectNameField';

interface ProjectUpdateFormData {
  name: string;
  description: string;
}

interface ProjectUpdateFormProps extends TranslateProps, InjectedFormProps {
  updateProject(data: ProjectUpdateFormData): Promise<void>;
}

export const PureProjectUpdateForm = (props: ProjectUpdateFormProps) => (
  <form
    onSubmit={props.handleSubmit(props.updateProject)}
    className="form-horizontal">
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-9">
      {ProjectNameField(props)}
      <TextField
        label={props.translate('Project description')}
        name="description"
      />
    </FormContainer>
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-9">
        <FieldError error={props.error}/>
        <SubmitButton
          submitting={props.submitting}
          label={props.translate('Update project details')}
        />
      </div>
    </div>
  </form>
);

export const ProjectUpdateForm = reduxForm({form: 'projectUpdate'})(PureProjectUpdateForm);

import { FunctionComponent } from 'react';
import { InjectedFormProps, reduxForm } from 'redux-form';

import {
  FieldError,
  FormContainer,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { StaticField } from '@waldur/form/StaticField';
import { TranslateProps } from '@waldur/i18n';

import { ProjectNameField } from './ProjectNameField';

interface ProjectUpdateFormData {
  name: string;
  description: string;
}

interface ProjectUpdateFormProps extends TranslateProps, InjectedFormProps {
  updateProject(data: ProjectUpdateFormData): Promise<void>;
  project_type?: string;
}

export const PureProjectUpdateForm: FunctionComponent<ProjectUpdateFormProps> = (
  props,
) => (
  <form
    onSubmit={props.handleSubmit(props.updateProject)}
    className="form-horizontal"
  >
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-9"
    >
      {ProjectNameField(props)}
      <TextField
        label={props.translate('Project description')}
        name="description"
      />
      {props.project_type && (
        <StaticField
          label={props.translate('Project type')}
          value={props.project_type}
        />
      )}
    </FormContainer>
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-9">
        <FieldError error={props.error} />
        <SubmitButton
          submitting={props.submitting}
          disabled={props.invalid}
          label={props.translate('Update project details')}
        />
      </div>
    </div>
  </form>
);

export const ProjectUpdateForm = reduxForm({ form: 'projectUpdate' })(
  PureProjectUpdateForm,
);

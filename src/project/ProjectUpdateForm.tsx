import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  FieldError,
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { ImageField } from '@waldur/form/ImageField';
import { StaticField } from '@waldur/form/StaticField';
import { validateMaxLength } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { Project } from '@waldur/workspace/types';

import { ProjectNameField } from './ProjectNameField';

interface ProjectUpdateFormData {
  name: string;
  description: string;
  end_date: string;
  backend_id: string;
}

interface ProjectUpdateFormProps extends InjectedFormProps {
  updateProject(data: ProjectUpdateFormData): Promise<void>;
  initialValues: Partial<Project>;
  project_type?: string;
  isDisabled: boolean;
  oecdCodes;
  isModal?: boolean;
}

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const PureProjectUpdateForm: FunctionComponent<ProjectUpdateFormProps> =
  (props) => (
    <form onSubmit={props.handleSubmit(props.updateProject)}>
      <FormContainer submitting={props.submitting} floating={true}>
        <StringField
          label={translate('Project owner')}
          name="customer_name"
          disabled={true}
        />
        {ProjectNameField({ isDisabled: props.isDisabled })}
        <TextField
          label={translate('Project description')}
          name="description"
          disabled={props.isDisabled}
          validate={validateMaxLength}
        />
        {props.oecdCodes && isFeatureVisible('project.oecd_fos_2007_code') ? (
          <SelectField
            floating={false}
            label={translate('OECD FoS code')}
            help_text={translate(
              'Please select OECD code corresponding to field of science and technology',
            )}
            name="oecd_fos_2007_code"
            options={props.oecdCodes}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            validate={isCodeRequired ? required : undefined}
            required={isCodeRequired}
          />
        ) : null}
        {isFeatureVisible('project.show_industry_flag') && (
          <AwesomeCheckboxField
            name="is_industry"
            label={translate(
              'Please mark if project is aimed at industrial use',
            )}
            hideLabel={true}
          />
        )}
        {props.project_type && (
          <StaticField
            label={translate('Project type')}
            value={props.project_type}
          />
        )}
        <Field
          name="end_date"
          label={translate('End date')}
          description={translate(
            'The date is inclusive. Once reached, all project resource will be scheduled for termination.',
          )}
          component={DateField}
          disabled={props.isDisabled}
          minDate={DateTime.now().plus({ days: 1 }).toISO()}
        />
        <StringField
          label={translate('Backend ID')}
          name="backend_id"
          disabled={props.isDisabled}
        />
        <ImageField
          floating={false}
          label={translate('Project image')}
          name="image"
          initialValue={props.initialValues.image}
        />
      </FormContainer>
      <Form.Group className="text-end">
        <FieldError error={props.error} />
        {(props.isModal ?? false) && <CloseDialogButton />}
        {props.dirty && (
          <SubmitButton
            submitting={props.submitting}
            disabled={props.invalid || props.isDisabled}
            label={translate('Update project details')}
            className="btn btn-primary ms-4"
          />
        )}
      </Form.Group>
    </form>
  );

export const ProjectUpdateForm = reduxForm({ form: 'projectUpdate' })(
  PureProjectUpdateForm,
);

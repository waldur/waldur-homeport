import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';

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
import { StaticField } from '@waldur/form/StaticField';
import {
  datePickerOverlayContainerInDialogs,
  reactSelectMenuPortaling,
} from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

import { ProjectNameField } from './ProjectNameField';

interface ProjectUpdateFormData {
  name: string;
  description: string;
  end_date: string;
  backend_id: string;
}

interface ProjectUpdateFormProps extends InjectedFormProps {
  updateProject(data: ProjectUpdateFormData): Promise<void>;
  project_type?: string;
  isStaff: boolean;
  isOwner: boolean;
  isDisabled: boolean;
  oecdCodes;
}

export const PureProjectUpdateForm: FunctionComponent<ProjectUpdateFormProps> =
  (props) => (
    <form onSubmit={props.handleSubmit(props.updateProject)}>
      <FormContainer
        submitting={props.submitting}
        labelClass="col-sm-3"
        controlClass="col-sm-9"
      >
        {ProjectNameField({ isDisabled: props.isDisabled })}
        <TextField
          label={translate('Project description')}
          name="description"
          disabled={props.isDisabled}
        />
        {props.oecdCodes && isFeatureVisible('project.oecd_fos_2007_code') ? (
          <SelectField
            label={translate('OECD FoS code')}
            help_text={translate(
              'Please select OECD code corresponding to field of science and technology',
            )}
            name="oecd_fos_2007_code"
            options={props.oecdCodes}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            {...reactSelectMenuPortaling()}
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
          {...datePickerOverlayContainerInDialogs()}
          disabled={props.isDisabled}
          minDate={DateTime.now().plus({ days: 1 }).toISO()}
        />
        <StringField
          label={translate('Backend ID')}
          name="backend_id"
          disabled={props.isDisabled}
        />
      </FormContainer>
      <Form.Group>
        <div className="col-sm-offset-3 col-sm-9">
          <FieldError error={props.error} />
          <SubmitButton
            submitting={props.submitting}
            disabled={props.invalid || props.isDisabled}
            label={translate('Update project details')}
          />
        </div>
      </Form.Group>
    </form>
  );

export const ProjectUpdateForm = reduxForm({ form: 'projectUpdate' })(
  PureProjectUpdateForm,
);

import { useAsync } from 'react-use';
import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { FormGroup, SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { loadOecdCodes } from '@waldur/project/api';
import { ProposalFormStepProps } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const ProjectDetailsStep = (props: ProposalFormStepProps) => {
  const { loading, value: oecdCodes } = useAsync(loadOecdCodes);

  return (
    <StepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={loading}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          <ActionButton
            title={translate('Import project')}
            action={null}
            variant="light"
          />
        </div>
      }
    >
      <Field
        name="name"
        component={FormGroup}
        label={translate('Project title')}
        validate={required}
        required
        floating
      >
        <StringField />
      </Field>
      <Field
        name="project_summary"
        component={FormGroup}
        maxLength={1000}
        label={translate('Project summary')}
        validate={required}
        required
        floating
      >
        <TextField />
      </Field>
      <Field
        name="description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Detailed description')}
        floating
      >
        <TextField />
      </Field>
      <Field
        name="project_has_civilian_purpose"
        component={FormGroup}
        label={translate('Project for civilian purpose?')}
      >
        <AwesomeCheckboxField />
      </Field>
      {oecdCodes && isFeatureVisible('project.oecd_fos_2007_code') ? (
        <Field
          name="oecd_fos_2007_code"
          component={FormGroup}
          label={translate('Research field (OECD code)')}
          tooltip={translate(
            'Please select OECD code corresponding to field of science and technology',
          )}
          validate={isCodeRequired ? required : undefined}
          required={isCodeRequired}
        >
          <SelectField
            options={oecdCodes}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            simpleValue
          />
        </Field>
      ) : null}
      <Field
        name="project_is_confidential"
        component={FormGroup}
        label={translate('Is the project confidential?')}
      >
        <AwesomeCheckboxField />
      </Field>
      <Field
        name="duration_in_days"
        component={FormGroup}
        label={translate('Project duration in days')}
        validate={required}
        required
        floating
      >
        <StringField />
      </Field>
      <Field
        name="supporting_documentation"
        className="mb-7"
        label={translate('Upload supporting documentation')}
        component={FormGroup}
      >
        <UploadDocumentationFiles proposal={props.params.proposal} />
      </Field>
    </StepCard>
  );
};

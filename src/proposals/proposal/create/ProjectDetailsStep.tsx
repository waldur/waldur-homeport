import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/config';
import { number, required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { FormGroup, SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { OECD_FOS_2007_CODES } from '@waldur/project/OECD_FOS_2007_CODES';
import { ProposalReview } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;

  return (
    <VStepperFormStepCard
      title={props.title}
      id={props.id}
      actions={
        <div className="d-flex justify-content-end flex-grow-1">
          <ActionButton
            title={translate('Import project')}
            action={null}
            iconNode={<DownloadSimpleIcon weight="bold" />}
            disabled
          />
        </div>
      }
    >
      <Field
        name="name"
        component={FormGroup}
        label={translate('Name')}
        placeholder={translate('Enter a name') + '...'}
        tooltip={translate(
          'Short title for the project, which explains the project goal as much as possible.',
        )}
        tooltipEnd
        validate={required}
        required
      >
        <StringField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_title"
      />

      <Field
        name="project_summary"
        component={FormGroup}
        maxLength={1000}
        label={translate('Summary')}
        placeholder={translate('Enter a summary') + '...'}
        tooltip={translate('Brief description of the project.')}
        tooltipEnd
        validate={required}
        required
      >
        <TextField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_summary"
      />

      <Field
        name="description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Description')}
        placeholder={translate('Enter a description') + '...'}
        tooltip={translate(
          'Explanation of the scientific case of the project for which the resources are intended to be used.',
        )}
        tooltipEnd
      >
        <TextField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_description"
      />

      <Field
        name="project_has_civilian_purpose"
        component={FormGroup}
        hideLabel
      >
        <AwesomeCheckboxField
          label={translate('Project for civilian purpose?')}
          size="sm"
          tooltip={translate('Mark if the project has a civilian purpose.')}
          tooltipEnd
        />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_has_civilian_purpose"
      />

      {isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
        <Field
          name="oecd_fos_2007_code"
          component={FormGroup}
          label={translate('Research field (OECD code)')}
          tooltip={translate('Select the main research field for the project.')}
          tooltipEnd
          validate={isCodeRequired ? required : undefined}
          required={isCodeRequired}
        >
          <SelectField
            options={OECD_FOS_2007_CODES}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            simpleValue
          />
        </Field>
      ) : null}
      <Field name="project_is_confidential" component={FormGroup} hideLabel>
        <AwesomeCheckboxField
          label={translate('Is the project confidential?')}
          size="sm"
          tooltip={translate(
            'Select if the project proposal contains confidential information.',
          )}
          tooltipEnd
        />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_is_confidential"
      />

      <Field
        name="duration_in_days"
        component={FormGroup}
        label={translate('Project duration in days')}
        placeholder={translate('Enter number of days') + '...'}
        tooltip={translate(
          'Expected project duration in days once resources have been granted.',
        )}
        tooltipEnd
        validate={[required, number]}
        required
      >
        <StringField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_duration"
      />

      <Field
        name="supporting_documentation"
        className="mb-7"
        label={translate('Upload supporting documentation')}
        component={FormGroup}
        tooltip={translate(
          'Upload additional documents, which support the proposal and help to review it.',
        )}
        tooltipEnd
      >
        <UploadDocumentationFiles proposal={props.params.proposal} />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_supporting_documentation"
      />
    </VStepperFormStepCard>
  );
};

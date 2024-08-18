import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
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

import { QuestionMark } from './QuestionMark';
import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;

  return (
    <VStepperFormStepCard
      title={props.title}
      step={props.step}
      id={props.id}
      completed={props.observed}
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
        actions={
          <QuestionMark
            tooltip={translate(
              'Short title for the project, which explains the project goal as much as possible.',
            )}
          />
        }
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
        label={translate('Project summary')}
        validate={required}
        required
        actions={
          <QuestionMark
            tooltip={translate('Brief description of the project.')}
          />
        }
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
        label={translate('Detailed description')}
        actions={
          <QuestionMark
            tooltip={translate(
              'Explanation of the scientific case of the project for which the resources are intended to be used.',
            )}
          />
        }
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
        label={translate('Project for civilian purpose?')}
        actions={
          <QuestionMark
            tooltip={translate('Mark if the project has a civilian purpose.')}
          />
        }
      >
        <AwesomeCheckboxField />
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
          validate={isCodeRequired ? required : undefined}
          required={isCodeRequired}
          actions={
            <QuestionMark
              tooltip={translate(
                'Select the main research field for the project.',
              )}
            />
          }
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
      <Field
        name="project_is_confidential"
        component={FormGroup}
        label={translate('Is the project confidential?')}
        actions={
          <QuestionMark
            tooltip={translate(
              'Select if the project proposal contains confidential information.',
            )}
          />
        }
      >
        <AwesomeCheckboxField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_is_confidential"
      />
      <Field
        name="duration_in_days"
        component={FormGroup}
        label={translate('Project duration in days')}
        validate={[required, number]}
        required
        actions={
          <QuestionMark
            tooltip={translate(
              'Expected project duration in days once resources have been granted.',
            )}
          />
        }
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
        actions={
          <QuestionMark
            tooltip={translate(
              'Upload additional documents, which support the proposal and help to review it.',
            )}
          />
        }
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

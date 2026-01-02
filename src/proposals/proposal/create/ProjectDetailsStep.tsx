import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { ENV } from '@waldur/core/config';
import { isEmpty } from '@waldur/core/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { OECD_FOS_2007_CODES } from '@waldur/project/OECD_FOS_2007_CODES';
import { Call, ProposalReview } from '@waldur/proposals/types';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { StepHeaderContent } from './StepHeaderContent';
import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

// Fields to track for completion count
const PROJECT_DETAIL_FIELDS = [
  'name',
  'project_summary',
  'description',
  'oecd_fos_2007_code',
  'duration_in_days',
  'supporting_documentation',
] as const;

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;
  const proposal = props.params?.proposal;
  const values = props.params?.values;
  const isCompleted = props.params?.isCompleted;
  const isRequired = props.params?.isRequired;
  const isOpen = props.params?.isOpen;
  const onToggle = props.params?.onToggle;

  // Count filled fields for metadata display
  const filledFieldsCount = useMemo(() => {
    if (!values) return 0;
    return PROJECT_DETAIL_FIELDS.filter((fieldName) => {
      const value = values[fieldName];
      return typeof value === 'object' ? !isEmpty(value) : Boolean(value);
    }).length;
  }, [values]);

  const { data: call } = useQuery({
    queryKey: ['Call', proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: proposal.call_uuid },
        query: { field: ['fixed_duration_in_days'] },
      }).then(
        (response) => response.data as Pick<Call, 'fixed_duration_in_days'>,
      ),

    refetchOnWindowFocus: false,
  });

  // Set duration from call's fixed_duration_in_days if available
  const form = useForm();
  useEffect(() => {
    if (call?.fixed_duration_in_days && !values?.duration_in_days) {
      form.change('duration_in_days', call.fixed_duration_in_days);
    }
  }, [call?.fixed_duration_in_days, form, values?.duration_in_days]);

  return (
    <AccordionCard
      title={translate('Project details')}
      subtitle={translate('Basic information about your research project.')}
      id={props.id}
      isOpen={isOpen}
      onToggle={onToggle}
      actions={
        <StepHeaderContent
          isCompleted={isCompleted}
          isRequired={isRequired}
          metadata={translate('{filled}/{total} fields filled', {
            filled: filledFieldsCount,
            total: PROJECT_DETAIL_FIELDS.length,
          })}
        />
      }
    >
      <FormGroup label={translate('Name')} required>
        <Field
          name="name"
          component={StringField as any}
          placeholder={translate('Enter a name...')}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_title"
      />

      <FormGroup label={translate('Summary')} required>
        <Field
          name="project_summary"
          component={TextField as any}
          placeholder={translate('Enter a summary...')}
          maxLength={1000}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_summary"
      />

      <FormGroup label={translate('Description')}>
        <Field
          name="description"
          component={TextField as any}
          placeholder={translate('Enter a description...')}
          maxLength={1000}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_description"
      />

      <FormGroup>
        <Field
          name="project_has_civilian_purpose"
          component={AwesomeCheckboxField as any}
          label={translate('Project for civilian purpose?')}
          size="sm"
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_has_civilian_purpose"
      />

      {isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
        <FormGroup
          label={translate('Research field (OECD code)')}
          required={isCodeRequired}
        >
          <Field
            name="oecd_fos_2007_code"
            component={SelectField as any}
            options={OECD_FOS_2007_CODES}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            simpleValue
          />
        </FormGroup>
      ) : null}
      <FormGroup>
        <Field
          name="project_is_confidential"
          component={AwesomeCheckboxField as any}
          label={translate('Is the project confidential?')}
          size="sm"
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_is_confidential"
      />

      <FormGroup label={translate('Project duration in days')} required>
        <Field
          name="duration_in_days"
          component={StringField as any}
          placeholder={translate('Enter number of days...')}
          disabled={!!call?.fixed_duration_in_days}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_duration"
      />

      <FormGroup label={translate('Upload supporting documentation')}>
        <Field
          name="supporting_documentation"
          render={({ input, meta }) => (
            <UploadDocumentationFiles
              input={input}
              meta={meta}
              proposal={props.params.proposal}
              refetch={props.params.refetch}
            />
          )}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_supporting_documentation"
      />
    </AccordionCard>
  );
};

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { isEmpty } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { StringGroup, TextGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { ScienceDomainGroup } from '@/project/create/ScienceDomainGroup';
import { Call, ProposalReview } from '@/proposals/types';
import { VStepperFormStepProps } from '@/wizard';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { StepHeaderContent } from './StepHeaderContent';
import { UploadDocumentationFiles } from './UploadDocumentationFiles';

// Fields to track for completion count
const PROJECT_DETAIL_FIELDS = [
  'name',
  'project_summary',
  'description',
  'science_sub_domain',
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

  // The science domain picker renders nothing when its feature is off, so
  // counting the field would leave the step permanently one short of its total.
  const trackedFields = useMemo(
    () =>
      isFeatureVisible(ProjectFeatures.science_domain)
        ? PROJECT_DETAIL_FIELDS
        : PROJECT_DETAIL_FIELDS.filter(
            (fieldName) => fieldName !== 'science_sub_domain',
          ),
    [],
  );

  // Count filled fields for metadata display
  const filledFieldsCount = useMemo(() => {
    if (!values) return 0;
    return trackedFields.filter((fieldName) => {
      const value = values[fieldName];
      return typeof value === 'object' ? !isEmpty(value) : Boolean(value);
    }).length;
  }, [values, trackedFields]);

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
            total: trackedFields.length,
          })}
        />
      }
    >
      <StringGroup
        name="name"
        placeholder={translate('Enter a name...')}
        label={translate('Name')}
        required
      />
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_title"
      />
      <TextGroup
        name="project_summary"
        placeholder={translate('Enter a summary...')}
        maxLength={1000}
        label={translate('Summary')}
        required
      />
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_summary"
      />
      <TextGroup
        name="description"
        placeholder={translate('Enter a description...')}
        maxLength={1000}
        label={translate('Description')}
      />
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_description"
      />
      <ScienceDomainGroup
        initialDomain={
          proposal.science_domain_uuid
            ? {
                uuid: proposal.science_domain_uuid,
                name: proposal.science_domain_name,
              }
            : null
        }
      />
      <StringGroup
        name="duration_in_days"
        placeholder={translate('Enter number of days...')}
        disabled={!!call?.fixed_duration_in_days}
        label={translate('Project duration in days')}
        required
      />
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

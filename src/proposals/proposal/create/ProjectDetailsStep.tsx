import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { AccordionCard } from '@/core/AccordionCard';
import { isEmpty } from '@/core/utils';
import { StringGroup, TextGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { ScienceDomainGroup } from '@/project/create/ScienceDomainGroup';
import { ProposalReview } from '@/proposals/types';
import { VStepperFormStepProps } from '@/wizard';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import {
  getFieldStates,
  getTrackedFields,
  isFieldRequired,
  isFieldVisible,
} from './proposalFields';
import { StepHeaderContent } from './StepHeaderContent';
import { UploadDocumentationFiles } from './UploadDocumentationFiles';

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;
  const proposal = props.params?.proposal;
  const values = props.params?.values;
  const isCompleted = props.params?.isCompleted;
  const isRequired = props.params?.isRequired;
  const isOpen = props.params?.isOpen;
  const onToggle = props.params?.onToggle;

  // Only the fields this call actually asks for are counted, so the step can
  // reach its own total. A field the call hides is neither rendered nor tracked.
  const fieldStates = useMemo(
    () => getFieldStates(props.params?.call?.proposal_field_config),
    [props.params?.call],
  );
  const trackedFields = useMemo(
    () => getTrackedFields(fieldStates),
    [fieldStates],
  );

  // Count filled fields for metadata display
  const filledFieldsCount = useMemo(() => {
    if (!values) return 0;
    return trackedFields.filter((fieldName) => {
      const value = values[fieldName];
      return typeof value === 'object' ? !isEmpty(value) : Boolean(value);
    }).length;
  }, [values, trackedFields]);

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
      {isFieldVisible(fieldStates, 'project_summary') && (
        <>
          <TextGroup
            name="project_summary"
            placeholder={translate('Enter a summary...')}
            maxLength={1000}
            label={translate('Summary')}
            required={isFieldRequired(fieldStates, 'project_summary')}
          />
          <FieldReviewComments
            reviews={reviews}
            fieldName="comment_project_summary"
          />
        </>
      )}
      {isFieldVisible(fieldStates, 'description') && (
        <>
          <TextGroup
            name="description"
            placeholder={translate('Enter a description...')}
            maxLength={1000}
            label={translate('Description')}
            required={isFieldRequired(fieldStates, 'description')}
          />
          <FieldReviewComments
            reviews={reviews}
            fieldName="comment_project_description"
          />
        </>
      )}
      {isFieldVisible(fieldStates, 'science_sub_domain') && (
        <ScienceDomainGroup
          required={isFieldRequired(fieldStates, 'science_sub_domain')}
          initialDomain={
            proposal.science_domain_uuid
              ? {
                  uuid: proposal.science_domain_uuid,
                  name: proposal.science_domain_name,
                }
              : null
          }
        />
      )}
      {/* The project duration is stated on the overview card, not asked here;
          comments left on the old duration field must survive that. */}
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_duration"
      />
      {isFieldVisible(fieldStates, 'supporting_documentation') && (
        <>
          <FormGroup
            label={translate('Upload supporting documentation')}
            required={isFieldRequired(fieldStates, 'supporting_documentation')}
          >
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
        </>
      )}
    </AccordionCard>
  );
};

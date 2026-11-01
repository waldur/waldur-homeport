import { FieldValidator } from 'final-form';
import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { AccordionCard } from 'waldur-ui';

import { isEmpty } from '@/core/utils';
import { validateMaxLength } from '@/core/validators';
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
  PROPOSAL_DESCRIPTION_MAX_LENGTH,
  PROPOSAL_SUMMARY_MAX_LENGTH,
} from './proposalFields';
import { StepHeaderContent } from './StepHeaderContent';
import { UploadDocumentationFiles } from './UploadDocumentationFiles';

// Module-level so each field keeps one validator across renders: a new
// function each render re-registers the field and re-validates.
//
// The summary mirrors the backend's grandfather rule: a value stored over the
// limit before it existed is accepted as long as it is left as it was loaded,
// and its counter stays grey. Only an edited value has to fit.
const validateSummary: FieldValidator<string> = (value, _allValues, meta) =>
  meta?.initial !== undefined && value === meta.initial
    ? undefined
    : validateMaxLength(PROPOSAL_SUMMARY_MAX_LENGTH)(value);
const validateDescription = validateMaxLength(PROPOSAL_DESCRIPTION_MAX_LENGTH);

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
            maxCharacters={PROPOSAL_SUMMARY_MAX_LENGTH}
            validate={validateSummary}
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
            maxCharacters={PROPOSAL_DESCRIPTION_MAX_LENGTH}
            validate={validateDescription}
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
          // getFieldStates already weighed the project feature against the
          // call: a science domain the call requires is shown regardless.
          alwaysShown
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

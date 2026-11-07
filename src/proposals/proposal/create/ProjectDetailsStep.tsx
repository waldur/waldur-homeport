import { FieldValidator } from 'final-form';
import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { AccordionCard } from 'waldur-ui';

import { validateMaxLength } from '@/core/validators';
import { SelectGroup, StringGroup, TextGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { ScienceDomainGroup } from '@/project/create/ScienceDomainGroup';
import { formatPrepaidMonths } from '@/proposals/prepaidDuration';
import { isOnProposalTeam } from '@/proposals/team/teamRules';
import { ProposalReview } from '@/proposals/types';
import { VStepperFormStepProps } from '@/wizard';
import { useUser } from '@/workspace/hooks';

import { fieldPart, isPartEditable } from '../changeRequests';
import { FieldReviewComments } from '../create-review/FieldReviewComments';

import {
  asksForDuration,
  DURATION_FIELD,
  getFieldStates,
  getTrackedFields,
  isFieldRequired,
  isFieldVisible,
  isProposalFieldFilled,
  PROPOSAL_FIELD_MAX_LENGTH,
} from './proposalFields';
import { StepHeaderContent } from './StepHeaderContent';
import { UploadDocumentationFiles } from './UploadDocumentationFiles';

// Module-level so each field keeps one validator across renders: a new
// function each render re-registers the field and re-validates.
//
// The summary mirrors the backend's grandfather rule: a value stored over the
// limit before it existed is accepted as long as it is left as it was loaded,
// and its counter stays grey. Only an edited value has to fit.
//
// The textareas take `maxCharacters`, not the native `maxLength`, which would
// cut a long paste silently instead of showing why it is refused.
const validateSummary: FieldValidator<string> = (value, _allValues, meta) =>
  meta?.initial !== undefined && value === meta.initial
    ? undefined
    : validateMaxLength(PROPOSAL_FIELD_MAX_LENGTH.project_summary)(value);
const validateDescription = validateMaxLength(
  PROPOSAL_FIELD_MAX_LENGTH.description,
);

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;
  const proposal = props.params?.proposal;
  const user = useUser();
  // Once submitted, a field is edited only while a request for changes
  // unlocks it.
  const locked = (name: string) => !isPartEditable(proposal, fieldPart(name));
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
  const allowedDurations: number[] =
    props.params?.call?.allowed_duration_months ?? [];
  const asksDuration = asksForDuration(props.params?.call);
  const trackedFields = useMemo(
    () => getTrackedFields(fieldStates, asksDuration),
    [fieldStates, asksDuration],
  );
  const durationOptions = useMemo(
    () =>
      allowedDurations.map((months) => ({
        value: months,
        label: formatPrepaidMonths(months),
      })),
    [allowedDurations],
  );

  const storedDocuments = proposal?.supporting_documentation;
  const filledFieldsCount = useMemo(
    () =>
      trackedFields.filter((fieldName) =>
        isProposalFieldFilled(fieldName, values, {
          supporting_documentation: storedDocuments,
        }),
      ).length,
    [values, trackedFields, storedDocuments],
  );

  return (
    <AccordionCard
      title={translate('Project details')}
      subtitle={
        isOnProposalTeam(user, proposal)
          ? translate('Basic information about your research project.')
          : translate('Basic information about the research project.')
      }
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
        maxLength={PROPOSAL_FIELD_MAX_LENGTH.name}
        showCharacterCount
        required
        disabled={locked('name')}
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
            maxCharacters={PROPOSAL_FIELD_MAX_LENGTH.project_summary}
            validate={validateSummary}
            label={translate('Summary')}
            required={isFieldRequired(fieldStates, 'project_summary')}
            disabled={locked('project_summary')}
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
            maxCharacters={PROPOSAL_FIELD_MAX_LENGTH.description}
            validate={validateDescription}
            label={translate('Description')}
            required={isFieldRequired(fieldStates, 'description')}
            disabled={locked('description')}
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
          disabled={locked('science_sub_domain')}
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
      {asksDuration && (
        <SelectGroup
          name={DURATION_FIELD}
          label={translate('Project duration')}
          description={translate(
            'How long the project should run. The call offers these lengths; no subscription requested may run longer.',
          )}
          options={durationOptions}
          simpleValue
          isClearable={false}
          placeholder={translate('Select a duration...')}
          required
          isDisabled={locked(DURATION_FIELD)}
        />
      )}
      {isFieldVisible(fieldStates, 'supporting_documentation') &&
        isPartEditable(proposal, 'documents') && (
          <>
            <FormGroup
              label={translate('Upload supporting documentation')}
              required={isFieldRequired(
                fieldStates,
                'supporting_documentation',
              )}
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

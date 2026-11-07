import { FC } from 'react';
import { StepKind } from 'waldur-js-client';

import { StringGroup } from '@/form';
import { translate } from '@/i18n';
import { outcomeLabel } from '@/proposals/workflow/constants';
import {
  applicantLabelsApply,
  STATUS_LABEL_PLACEHOLDERS,
  StatusLabelAudience,
  statusLabelProblem,
} from '@/proposals/workflow/statusLabels';

import { StepFormValues } from './stepForm';

const AudienceFields: FC<{
  audience: StatusLabelAudience;
  title: string;
  description: string;
  outcomes: string[];
  changesRequested: boolean;
}> = ({ audience, title, description, outcomes, changesRequested }) => {
  const name = (state: string) => `status_labels.${audience}.${state}`;
  const validate = (value: string) => statusLabelProblem(audience, value);
  return (
    <fieldset className="mb-5" data-testid={`status-labels-${audience}`}>
      <legend className="text-sm font-medium">{title}</legend>
      <p className="text-quaternary">{description}</p>
      <StringGroup
        name={name('active')}
        label={translate('While the step runs')}
        maxLength={255}
        validate={validate}
      />
      {changesRequested && (
        <StringGroup
          name={name('changes_requested')}
          label={translate('While changes are requested')}
          maxLength={255}
          validate={validate}
        />
      )}
      <StringGroup
        name={name('completed')}
        label={translate('Once the step has ended')}
        maxLength={255}
        validate={validate}
      />
      {outcomes.map((outcome) => (
        <StringGroup
          key={outcome}
          name={`status_labels.${audience}.outcomes.${outcome}`}
          label={translate('Ended as {outcome}', {
            outcome: outcomeLabel(outcome),
          })}
          maxLength={255}
          validate={validate}
        />
      ))}
    </fieldset>
  );
};

/**
 * What each audience's dashboard calls the step. Each label is optional:
 * left empty, the label the portal computes stays. The labels are shown as
 * entered, so a call writes them in the language it runs in.
 */
export const StatusLabelsFields: FC<{
  kind: StepKind;
  values: StepFormValues;
}> = ({ kind, values }) => {
  const outcomes =
    kind.outcome_sets.find(
      (set) => set.id === (values.outcome_set ?? kind.default_outcome_set),
    )?.outcomes ?? [];
  const changesRequested = Boolean(values.allows_change_requests);
  return (
    <div data-testid="status-labels">
      <h3 className="text-base mb-1.5">{translate('Status labels')}</h3>
      <p className="text-quaternary mb-3">
        {translate(
          "What each audience's dashboard calls this step, shown as entered. Leave a label empty to keep the one the portal shows today.",
        )}
      </p>
      {applicantLabelsApply({ ...values, kind: kind.id }) ? (
        <AudienceFields
          audience="applicant"
          title={translate('Applicant')}
          description={translate(
            "On the applicant's proposal list and progress tracker.",
          )}
          outcomes={outcomes}
          changesRequested={changesRequested}
        />
      ) : (
        <p
          className="text-quaternary"
          data-testid="status-labels-applicant-hidden"
        >
          {translate(
            "The step is hidden from applicants, who see it as 'Internal check' whatever it is labeled. Make it visible to applicants to label it for them.",
          )}
        </p>
      )}
      <p className="text-quaternary" data-testid="status-labels-counts">
        {translate(
          'Labels other than the applicant\'s may show counts of the step\'s work: {placeholders}. For example: "{example}".',
          {
            placeholders: STATUS_LABEL_PLACEHOLDERS.map(
              (placeholder) => `{${placeholder}}`,
            ).join(', '),
            example: '{submitted} of {expected} reviews submitted',
          },
        )}
      </p>
      <AudienceFields
        audience="evaluators"
        title={translate('Evaluators')}
        description={translate(
          'On the proposal lists and step lists of the evaluators working on the step: reviewers, panel members, evaluator roles. Also what the call team and the offering teams read where their own labels are left empty.',
        )}
        outcomes={outcomes}
        changesRequested={changesRequested}
      />
      <AudienceFields
        audience="call_team"
        title={translate('Call team')}
        description={translate(
          "On the proposal lists and step lists of the call managers, staff and support. Empty labels fall back to the evaluators'.",
        )}
        outcomes={outcomes}
        changesRequested={changesRequested}
      />
      <AudienceFields
        audience="offering_team"
        title={translate('Offering teams')}
        description={translate(
          "On the proposal lists and step lists of the offering teams, for the steps they work on, such as a technical assessment of their offering. Empty labels fall back to the evaluators'.",
        )}
        outcomes={outcomes}
        changesRequested={changesRequested}
      />
    </div>
  );
};

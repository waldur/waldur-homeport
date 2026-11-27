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
    // 16px between the inputs of one audience, and a divider between
    // audiences with 12px either side.
    <fieldset
      className="mb-3 border-t border-secondary pt-3 first-of-type:border-t-0 first-of-type:pt-0"
      data-testid={`status-labels-${audience}`}
    >
      <legend className="text-sm font-semibold text-primary mb-1">
        {title}
      </legend>
      <p className="text-quaternary mb-3">{description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
        <StringGroup
          name={name('active')}
          label={translate('While the step runs')}
          description={
            audience === 'applicant' ? undefined : (
              <span data-testid="status-labels-counts">
                {translate('Can include counts, e.g. {example}.', {
                  example: '{submitted} of {expected} reviews submitted',
                })}
              </span>
            )
          }
          tooltip={
            audience === 'applicant'
              ? undefined
              : translate('Counts available: {placeholders}.', {
                  placeholders: STATUS_LABEL_PLACEHOLDERS.map(
                    (placeholder) => `{${placeholder}}`,
                  ).join(', '),
                })
          }
          spaceless
          maxLength={255}
          validate={validate}
        />
        {changesRequested && (
          <StringGroup
            name={name('changes_requested')}
            label={translate('While changes are requested')}
            spaceless
            maxLength={255}
            validate={validate}
          />
        )}
        <StringGroup
          name={name('completed')}
          label={translate('Once the step has ended')}
          spaceless
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
            spaceless
            maxLength={255}
            validate={validate}
          />
        ))}
      </div>
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
    <div
      className="border-t border-secondary pt-5 mt-2"
      data-testid="status-labels"
    >
      <h4 className="mb-1.5">{translate('Status labels')}</h4>
      <p className="text-quaternary mb-3">
        {translate(
          "What each audience sees as this step's status. Leave empty to keep the default.",
        )}
      </p>
      {applicantLabelsApply({ ...values, kind: kind.id }) ? (
        <AudienceFields
          audience="applicant"
          title={translate('Applicant')}
          description={translate('Proposal list and progress tracker.')}
          outcomes={outcomes}
          changesRequested={changesRequested}
        />
      ) : (
        <p
          className="text-quaternary mb-3"
          data-testid="status-labels-applicant-hidden"
        >
          {translate(
            "The step is hidden from applicants, who see it as 'Internal check' whatever it is labeled. Make it visible to applicants to label it for them.",
          )}
        </p>
      )}
      <AudienceFields
        audience="evaluators"
        title={translate('Evaluators')}
        description={translate(
          "Reviewers' and panel members' lists. Also the fallback for the call team and offering teams.",
        )}
        outcomes={outcomes}
        changesRequested={changesRequested}
      />
      <AudienceFields
        audience="call_team"
        title={translate('Call team')}
        description={translate("Call managers', staff and support lists.")}
        outcomes={outcomes}
        changesRequested={changesRequested}
      />
      <AudienceFields
        audience="offering_team"
        title={translate('Offering teams')}
        description={translate(
          "Offering teams' lists, for steps they work on.",
        )}
        outcomes={outcomes}
        changesRequested={changesRequested}
      />
    </div>
  );
};

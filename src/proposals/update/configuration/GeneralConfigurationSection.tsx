import { FC, useMemo } from 'react';
import { proposalProtectedCallsAvailableComplianceChecklistsList } from 'waldur-js-client';

import {
  AsyncSelectEditField,
  BooleanEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
  TextEditField,
} from '@/form/editFields';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { RoleEnum } from '@/permissions/enums';
import { CallDurationPolicy } from '@/proposals/CallDurationPolicy';
import { formatPrepaidMonths } from '@/proposals/prepaidDuration';
import {
  getPublishResultsOptions,
  getUndecidedAtCompletionOptions,
} from '@/proposals/roundLifecycle';
import { Call } from '@/proposals/types';
import { useUpdateCall } from '@/proposals/update/useUpdateCall';
import { getCallReadOnlyReason } from '@/proposals/utils';

/**
 * The backend accepts a positive number of days only. Validation lives here
 * rather than in the control's `min`, because `BaseNumberField` clamps an
 * out-of-range value on blur — with `min=1` an emptied input would snap to 1
 * and silently set a one-day duration instead of clearing it.
 */
export const validateFixedDuration = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1
    ? undefined
    : translate('Enter a whole number of days, 1 or more.');
};

/** Lengths a call commonly lets the applicant choose from, in months. */
const DURATION_CHOICES = [1, 2, 3, 4, 6, 9, 12, 18, 24, 36];

/**
 * A call either fixes the length of every project or lets the applicant
 * choose it from a list; the backend refuses both. Setting one clears the
 * other in the same request, so switching takes a single edit.
 */
export const exclusiveDurationPolicy = (body: Record<string, any>) => {
  if (body.allowed_duration_months?.length) {
    return { fixed_duration_in_days: null };
  }
  if (body.fixed_duration_in_days) {
    return { allowed_duration_months: [] };
  }
  return {};
};

/**
 * A call places one marketplace order per resource it grants. This decides
 * who those orders are created by — the person named on them, who receives
 * the order notifications. It grants nothing: the call review authorised the
 * spend, and the orders are carried out with system authority.
 */
const getOrderAuthorOptions = () => [
  { value: 'applicant', label: translate('Proposal applicant') },
  { value: 'project_manager', label: translate('Project manager') },
  { value: 'call_manager', label: translate('Call manager') },
  { value: 'specific_user', label: translate('Named contact') },
];

/**
 * The call stores its named contact as a bare UUID, but the async user picker
 * can only display an option object — react-select drops any other value, so
 * the box would read as empty. Seed an option from the call's own name for it.
 */
export const formatOrderAuthorUser = (
  value: any,
  call: Pick<Call, 'order_author_user_name'>,
) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return { uuid: value, full_name: call.order_author_user_name };
  }
  return value;
};

/**
 * When a submitted proposal's review workflow starts. `at_cutoff` holds every
 * proposal in `submitted` until its round closes, so a panel evaluates the
 * whole batch of a cut-off together.
 */
const getEvaluationStartOptions = () => [
  { value: 'on_submission', label: translate('On submission') },
  { value: 'at_cutoff', label: translate('At the round cut-off') },
];

/**
 * The proposal roles whose holders a call copies (Cc) on every mail to the
 * applicant. The proposal manager is the principal investigator.
 */
const getApplicantCcRoleOptions = () => [
  {
    value: RoleEnum.PROPOSAL_MANAGER,
    label: translate('Proposal managers (principal investigator)'),
  },
  {
    value: RoleEnum.PROPOSAL_ADMIN,
    label: translate('Proposal administrators'),
  },
  { value: RoleEnum.PROPOSAL_MEMBER, label: translate('Proposal members') },
];

/**
 * What a UUID-backed picker submits: the picked option's UUID, an unchanged
 * UUID as it is, and `null` for anything cleared, an empty string included.
 */
const normalizeUuidChoice = (value: any) => value?.uuid ?? (value || null);

/** The API takes the contact as a bare UUID, or `null` to clear it. */
export const normalizeOrderAuthorUser = normalizeUuidChoice;

/**
 * The call stores its compliance checklist as a bare UUID, but the picker can
 * only display an option object. Seed one from the call's own checklist name,
 * or from the UUID itself when the name is missing, so the box never shows a
 * blank chip.
 */
export const formatComplianceChecklist = (
  value: any,
  call: Pick<Call, 'compliance_checklist_name'>,
) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return { uuid: value, name: call.compliance_checklist_name || value };
  }
  return value;
};

/** The API takes the checklist as a bare UUID, or `null` to clear it. */
export const normalizeComplianceChecklist = normalizeUuidChoice;

interface GeneralConfigurationSectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

export const GeneralConfigurationSection: FC<
  GeneralConfigurationSectionProps
> = (props) => {
  const updateCall = useUpdateCall(props.call, props.refetch);

  const handleSubmit = (formData: Record<string, any>) => {
    const body = { ...formData };
    if ('compliance_checklist' in body) {
      body.compliance_checklist = normalizeComplianceChecklist(
        body.compliance_checklist,
      );
    }
    if ('order_author_user' in body) {
      body.order_author_user = normalizeOrderAuthorUser(body.order_author_user);
    }
    Object.assign(body, exclusiveDurationPolicy(body));

    // No confirmation for a changed fixed duration: allocation reads it from
    // the call when the project is created, so unallocated proposals follow
    // it without any of their rows being rewritten.
    return updateCall(body);
  };

  const orderAuthorOptions = useMemo(getOrderAuthorOptions, []);
  const applicantCcRoleOptions = useMemo(getApplicantCcRoleOptions, []);
  const durationOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...DURATION_CHOICES,
          ...(props.call.allowed_duration_months ?? []),
        ]),
      )
        .sort((a, b) => a - b)
        .map((months) => ({
          value: months,
          label: formatPrepaidMonths(months),
        })),
    [props.call.allowed_duration_months],
  );
  const evaluationStartOptions = useMemo(getEvaluationStartOptions, []);
  const publishResultsOptions = useMemo(getPublishResultsOptions, []);
  const undecidedAtCompletionOptions = useMemo(
    getUndecidedAtCompletionOptions,
    [],
  );

  const loadComplianceChecklists = useMemo(
    () =>
      createLoadOptions(
        proposalProtectedCallsAvailableComplianceChecklistsList,
        'name',
        {
          checklist_type: 'proposal_compliance',
          customer_uuid: props.call.customer_uuid,
        },
      ),
    [props.call.customer_uuid],
  );

  return (
    <EditFieldProvider
      scope={props.call}
      callback={handleSubmit}
      readOnlyReason={
        props.isReadOnly ? getCallReadOnlyReason(props.call) : undefined
      }
    >
      <div className="mb-4">
        {/* Grouped and searchable, as an offering's integration options:
            the call's settings no longer fit one long list. */}
        <TabbedSection
          title={translate('General configuration')}
          enableSearch
          syncKey="config_tab"
        >
          <TabbedSection.Tab id="duration" title={translate('Duration')}>
            <NumberEditField
              name="fixed_duration_in_days"
              label={translate('Fixed duration for granted projects (in days)')}
              description={translate(
                'Every granted project lasts exactly this long, and no prepaid subscription requested under the call may run past it. Setting it clears the durations the applicant chooses from. Leave both empty to let the longest subscription requested decide.',
              )}
              disabled={props.isReadOnly}
              validate={validateFixedDuration}
              renderValue={(value) =>
                value ? (
                  <CallDurationPolicy
                    call={{ fixed_duration_in_days: value }}
                  />
                ) : (
                  translate('Not fixed')
                )
              }
            />
            <SelectEditField
              name="allowed_duration_months"
              label={translate('Durations the applicant chooses from')}
              description={translate(
                'The applicant picks the project length from these, and the award may move it to another of them. No prepaid subscription may run longer than the chosen length. Setting a list clears the fixed duration; proposals already submitted keep the length they asked for.',
              )}
              options={durationOptions}
              isMulti
              simpleValue
              isClearable
              disabled={props.isReadOnly}
              renderValue={(value) =>
                value?.length
                  ? value.map(formatPrepaidMonths).join(', ')
                  : translate('No choice offered')
              }
            />
          </TabbedSection.Tab>
          <TabbedSection.Tab id="evaluation" title={translate('Evaluation')}>
            {/* The backend refuses a change while the call has submitted or
                in-review proposals. The call does not say whether it has any
                (has_proposals counts drafts too), so the rule is stated here and
                a refused save reports the backend's reason. */}
            <SelectEditField
              name="evaluation_start"
              label={translate('Evaluation starts')}
              description={translate(
                'On submission starts the review of each proposal as soon as it is submitted. At the round cut-off holds submitted proposals until the round closes, then starts them together. Cannot be changed while the call has submitted or in-review proposals.',
              )}
              options={evaluationStartOptions}
              simpleValue
              isClearable={false}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                evaluationStartOptions.find((o) => o.value === value)?.label ||
                translate('On submission')
              }
            />
            <NumberEditField
              name="target_decision_days"
              label={translate('Target days from cut-off to decision')}
              description={translate(
                "How many days the evaluation is planned to take from a round's cut-off to its decision. A round with an allocation date uses that date instead. The workflow check warns when the steps' durations up to the decision take longer.",
              )}
              disabled={props.isReadOnly}
              validate={validateFixedDuration}
              renderValue={(value) =>
                value
                  ? translate('{count} days', { count: value })
                  : translate('Not set')
              }
            />
          </TabbedSection.Tab>
          <TabbedSection.Tab
            id="decisions"
            title={translate('Decisions and rounds')}
          >
            {/* Switching is refused while decisions are held for a round's
                publication; the backend's reason is shown on a refused save. */}
            <SelectEditField
              name="publish_results"
              label={translate('Applicants learn the decision')}
              description={translate(
                "As each decision is made announces every allocation decision to its applicant at once. Together for the whole round holds the decisions of a round, which the call team sees as tentative, until a call manager publishes the round's results; then every applicant is told at the same time. Cannot be changed while decisions are held.",
              )}
              options={publishResultsOptions}
              simpleValue
              isClearable={false}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                publishResultsOptions.find((o) => o.value === value)?.label ||
                publishResultsOptions[0].label
              }
            />
            <BooleanEditField
              name="adoption_required"
              label={translate('Results are adopted before publication')}
              description={translate(
                "A body such as a governing board adopts each round's results. The adoption is recorded while the round is deciding, and the round's results cannot be published until it is; once adopted, a held decision can no longer be reopened.",
              )}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                value ? translate('Yes') : translate('No')
              }
            />
            <SelectEditField
              name="undecided_at_round_completion"
              label={translate('Undecided proposals when a round is completed')}
              description={translate(
                'What completing a round does with proposals that still have no decision. Blocking refuses to complete the round until each is decided; rejecting rejects each where it stands and tells its applicant. A round can override this rule.',
              )}
              options={undecidedAtCompletionOptions}
              simpleValue
              isClearable={false}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                undecidedAtCompletionOptions.find((o) => o.value === value)
                  ?.label || undecidedAtCompletionOptions[0].label
              }
            />
            <BooleanEditField
              name="carry_over_drafts"
              label={translate(
                'Carry unsubmitted drafts over to the next round',
              )}
              description={translate(
                'When a round closes, move unsubmitted drafts to the next round instead of canceling them. Applicants keep their content and are notified by email. Drafts are canceled as before when the call has no later round.',
              )}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                value ? translate('Yes') : translate('No')
              }
            />
          </TabbedSection.Tab>
          <TabbedSection.Tab id="compliance" title={translate('Compliance')}>
            <AsyncSelectEditField
              name="compliance_checklist"
              label={translate('Compliance checklist')}
              description={translate(
                'Optional checklist for proposal compliance evaluation. Can only be changed when no proposals exist for this call.',
              )}
              loadOptions={loadComplianceChecklists}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              format={(value) => formatComplianceChecklist(value, props.call)}
              emptyValue={null}
              isClearable={true}
              placeholder={translate('Select compliance checklist (optional)')}
              disabled={props.isReadOnly || props.call.has_proposals}
              tooltip={
                !props.isReadOnly && props.call.has_proposals
                  ? translate(
                      'The compliance checklist cannot be changed once proposals exist for this call.',
                    )
                  : undefined
              }
              renderValue={() =>
                props.call.compliance_checklist_name ||
                translate('Not configured')
              }
            />
            <TextEditField
              name="coi_declaration_text"
              label={translate('Conflict-of-interest declaration')}
              description={translate(
                "What evaluators confirm on the steps asking them to declare having no conflict of interest, unless a step words its own. Leave empty for the platform's standard declaration. A change applies to confirmations made after it; earlier ones keep the words confirmed.",
              )}
              disabled={props.isReadOnly}
              maxLength={5000}
              renderValue={(value) =>
                value || translate("The platform's standard declaration")
              }
            />
          </TabbedSection.Tab>
          <TabbedSection.Tab id="applicants" title={translate('Applicants')}>
            <SelectEditField
              name="applicant_cc_roles"
              label={translate('Copied on mail to the applicant')}
              description={translate(
                "Every mail to the applicant about a proposal — its submission, the outcome of each step they are told of, requests for changes, the results — copies whoever holds these roles on the proposal's team, each address once.",
              )}
              options={applicantCcRoleOptions}
              isMulti
              simpleValue
              isClearable
              disabled={props.isReadOnly}
              renderValue={(value) =>
                value?.length
                  ? value
                      .map(
                        (role) =>
                          applicantCcRoleOptions.find((o) => o.value === role)
                            ?.label ?? role,
                      )
                      .join(', ')
                  : translate('Nobody')
              }
            />
            <BooleanEditField
              name="reviewer_identity_visible_to_submitters"
              label={translate('Reviewer identity visible to applicants')}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                value ? translate('Yes') : translate('No')
              }
            />
            <BooleanEditField
              name="reviews_visible_to_submitters"
              label={translate('Reviews visible to applicants')}
              description={translate(
                'Applicants still see the steps an applicant step lists as its inputs, such as the reviews they respond to.',
              )}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                value ? translate('Yes') : translate('No')
              }
            />
          </TabbedSection.Tab>
          <TabbedSection.Tab id="orders" title={translate('Orders')}>
            <SelectEditField
              name="order_author"
              label={translate('Resource orders created by')}
              description={translate(
                'Who the orders for resources granted by this call are created by. That person is named on each order and receives the order notifications.',
              )}
              options={orderAuthorOptions}
              simpleValue
              isClearable={false}
              disabled={props.isReadOnly}
              renderValue={(value) =>
                orderAuthorOptions.find((o) => o.value === value)?.label ||
                translate('Proposal applicant')
              }
            />
            {props.call.order_author === 'specific_user' && (
              <AsyncSelectEditField
                name="order_author_user"
                label={translate('Named contact')}
                description={translate(
                  'Every order this call places is attributed to this person — a shared mailbox, for example. They must hold a role on this call or on the organization managing it.',
                )}
                loadOptions={userAutocomplete}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) =>
                  option.email
                    ? `${option.full_name || option.username} (${option.email})`
                    : option.full_name || option.username
                }
                format={(value) => formatOrderAuthorUser(value, props.call)}
                emptyValue={null}
                isClearable={true}
                placeholder={translate('Select a user')}
                disabled={props.isReadOnly}
                renderValue={() =>
                  props.call.order_author_user_name ||
                  translate('Not set — falls back to the proposal applicant')
                }
              />
            )}
          </TabbedSection.Tab>
        </TabbedSection>
      </div>
    </EditFieldProvider>
  );
};

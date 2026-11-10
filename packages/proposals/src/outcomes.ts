import { translate } from 'waldur-i18n-runtime';
import { OutcomeEnum } from 'waldur-js-client';

export const outcomeLabel = (outcome: OutcomeEnum | string): string => {
  switch (outcome) {
    case 'eligible':
      return translate('Eligible');
    case 'ineligible':
      return translate('Ineligible');
    case 'feasible':
      return translate('Feasible');
    case 'infeasible':
      return translate('Infeasible');
    case 'reviewed':
      return translate('Reviewed');
    case 'approved':
      return translate('Approved');
    case 'declined':
      return translate('Declined');
    case 'accepted':
      return translate('Accepted');
    case 'submitted':
      return translate('Submitted');
    case 'done':
      return translate('Done');
    case 'rejected':
      return translate('Rejected');
    case 'expired':
      return translate('Expired');
    case 'no_response':
      return translate('No response');
    case 'conditionally_accepted':
      return translate('Conditionally accepted');
    default:
      return outcome;
  }
};

/** What one contribution to a per-offering assessment concluded. */
export const contributionOutcomeLabel = (outcome: string): string => {
  switch (outcome) {
    case 'accepted':
      return translate('Accepted');
    case 'conditionally_accepted':
      return translate('Conditionally accepted');
    case 'rejected':
      return translate('Rejected');
    default:
      return outcomeLabel(outcome);
  }
};

export const contributionOutcomeVariant = (
  outcome: string | null | undefined,
): 'success' | 'warning' | 'danger' | 'neutral' => {
  switch (outcome) {
    case 'accepted':
    case 'feasible':
    case 'eligible':
    case 'approved':
      return 'success';
    case 'conditionally_accepted':
      return 'warning';
    case 'rejected':
    case 'infeasible':
    case 'ineligible':
    case 'declined':
      return 'danger';
    default:
      return 'neutral';
  }
};

/** The outcomes a step offers, as options for a select. */
export const outcomeOptions = (outcomes: string[]) =>
  outcomes.map((value) => ({ value, label: contributionOutcomeLabel(value) }));

/**
 * A contribution's status. "expired" on a step still running means the
 * contributor lost standing (the role went, or a conflict of interest was
 * recorded) and the slot comes back if they regain it: it is paused, not over.
 */
export const contributionStatusLabel = (
  status: string,
  stepActive = false,
): string => {
  if (status === 'expired' && stepActive) {
    return translate('Paused');
  }
  switch (status) {
    case 'pending':
      return translate('Pending');
    case 'accepted':
      return translate('In progress');
    case 'submitted':
      return translate('Submitted');
    case 'declined':
      return translate('Declined');
    case 'withdrawn':
      return translate('Withdrawn');
    case 'expired':
      return translate('Expired');
    default:
      return status;
  }
};

/** Why a contribution stopped, for a tooltip on its status; empty otherwise. */
export const contributionStatusHint = (
  status: string,
  stepActive = false,
): string => {
  switch (status) {
    case 'expired':
      return stepActive
        ? translate(
            'Paused: the contributor no longer holds the role or has a conflict of interest.',
          )
        : translate('The step ended before this contribution was submitted.');
    case 'withdrawn':
      return translate(
        'Withdrawn by a call manager, or closed when the step was decided or the contributor joined the applicant team.',
      );
    default:
      return '';
  }
};

import { translate } from 'waldur-i18n-runtime';
import {
  ProviderRequestedOffering,
  proposalRequestedOfferingsAccept,
  proposalRequestedOfferingsCancel,
} from 'waldur-js-client';
import { useManagedMutation } from 'waldur-shell';
import { BaseButton } from 'waldur-ui';

import { formatAmount } from './format';
import { PROVIDER_CALLS_QUERY_KEY } from './queries';

const invalidateQueries = [{ queryKey: [PROVIDER_CALLS_QUERY_KEY] }];

/** What accepting commits the provider to, in one sentence per component. */
const describeCommitments = (row: ProviderRequestedOffering) => {
  const rules = row.component_rules ?? [];
  if (rules.length === 0) {
    return translate(
      'The call puts no bounds on what a proposal may request of {offering}.',
      { offering: row.offering_name },
    );
  }
  return rules
    .map((rule) => {
      const unit = rule.measured_unit;
      if (rule.is_fixed) {
        return translate('{component}: fixed at {amount} per proposal', {
          component: rule.component_type,
          amount: formatAmount(rule.default_amount, unit),
        });
      }
      return translate('{component}: {min} to {max} per proposal', {
        component: rule.component_type,
        min: formatAmount(rule.min_per_proposal ?? 0, unit),
        max:
          rule.max_per_proposal === null
            ? translate('any amount')
            : formatAmount(rule.max_per_proposal, unit),
      });
    })
    .join('; ')
    .concat('.');
};

/**
 * Accept or decline a call's request for one of the provider's offerings.
 * Only a request still waiting has these; the backend refuses any other.
 */
export const RequestActions = ({ row }: { row: ProviderRequestedOffering }) => {
  const accept = useManagedMutation({
    mutationFn: () =>
      proposalRequestedOfferingsAccept({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Accept the request for {offering}?', {
        offering: row.offering_name,
      }),
      body: translate(
        '{call} will offer {offering} to its applicants. {commitments}',
        {
          call: row.call_name,
          offering: row.offering_name,
          commitments: describeCommitments(row),
        },
      ),
      options: { type: 'success', positiveButton: translate('Accept') },
    },
    invalidateQueries,
    closeModal: false,
    successMessage: translate('Request accepted.'),
    errorMessage: translate('Could not accept the request.'),
  });

  const decline = useManagedMutation<unknown, unknown, { input?: string }>({
    mutationFn: ({ input }) =>
      proposalRequestedOfferingsCancel({
        path: { uuid: row.uuid },
        body: { reason: input ?? '' },
      }),
    confirmation: {
      title: translate('Decline the request for {offering}?', {
        offering: row.offering_name,
      }),
      body: translate(
        'The call managers of {call} are told, with your reason.',
        { call: row.call_name },
      ),
      options: {
        type: 'danger',
        positiveButton: translate('Decline'),
        showInput: true,
        inputRequired: true,
        inputLabel: translate('Reason'),
      },
    },
    invalidateQueries,
    closeModal: false,
    successMessage: translate('Request declined.'),
    errorMessage: translate('Could not decline the request.'),
  });

  // Hidden, not disabled, while the request is answered: the row leaves the
  // "waiting" list as soon as the answer is in.
  if (row.state !== 'requested' || accept.isPending || decline.isPending) {
    return null;
  }
  return (
    <div className="flex justify-end gap-2">
      <BaseButton
        size="sm"
        variant="tertiary"
        label={translate('Decline')}
        onClick={() => decline.mutate()}
      />
      <BaseButton
        size="sm"
        variant="primary"
        label={translate('Accept')}
        onClick={() => accept.mutate()}
      />
    </div>
  );
};

import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalPublicCallsList } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { SHORT_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';

interface ActiveCallDiscountNoticeProps {
  offeringUuid: string;
}

/**
 * Warns a provider that this offering is live in calls whose applicants are
 * being quoted without these discounts.
 *
 * Only the per-resource, tier-shaped case can be shown while a proposal is
 * written; every other scope or formula is applied at invoice finalization, so
 * the applicant plans against one number and is billed another. Silent
 * everywhere else — a discount on an offering no call has committed to harms
 * nobody, and a warning shown to every provider is a warning nobody reads.
 */
export const ActiveCallDiscountNotice: FC<ActiveCallDiscountNoticeProps> = ({
  offeringUuid,
}) => {
  const { data } = useQuery({
    queryKey: ['offeringActiveCalls', offeringUuid],
    queryFn: () =>
      proposalPublicCallsList({
        query: { offering_uuid: offeringUuid, state: ['active'], page_size: 5 },
      }).then((response) => response.data),
    staleTime: SHORT_STALE_TIME,
    enabled: Boolean(offeringUuid),
    // A provider must still be able to edit discounts if the call list is
    // unavailable; the notice is advisory.
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });

  if (!data?.length) {
    return null;
  }
  return (
    <AlertItem
      variant="warning"
      className="mb-5"
      title={translate('This offering is open in {count} active call(s)', {
        count: data.length,
      })}
      body={translate(
        'Applicants to {calls} see prices while writing a proposal. A discount is only shown there when its scope is per-resource and its formula is tier-based — otherwise they plan against the undiscounted price and are billed the discounted one.',
        { calls: data.map((call) => call.name).join(', ') },
      )}
    />
  );
};

import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { proposalRequestedOfferingsList } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { needsOfferingManagers } from './providerCalls';
import { ProviderCallsTable } from './ProviderCallsTable';

interface OfferingCallsSectionProps {
  offeringUuid: string;
  providerUuid: string;
}

/**
 * The calls the offering is in, on its Team tab: the people listed above are
 * who those calls hand work to. Says so loudly when a call needs the team and
 * nobody is on it. Absent for an offering no call has requested.
 */
export const OfferingCallsSection: FC<OfferingCallsSectionProps> = ({
  offeringUuid,
  providerUuid,
}) => {
  const enabled = isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );
  const { data: requests = [] } = useQuery({
    queryKey: ['offering-call-requests', offeringUuid],
    queryFn: async () =>
      (
        await proposalRequestedOfferingsList({
          query: {
            offering_uuid: offeringUuid,
            state: ['requested', 'accepted'],
            page_size: 100,
          },
        })
      ).data,
    enabled,
  });
  if (!enabled || !requests.length) {
    return null;
  }
  const needing = requests.filter(needsOfferingManagers);
  return (
    <div className="mt-5">
      {needing.length ? (
        <AlertItem
          type="floating"
          variant="error"
          className="mb-3"
          title={translate(
            'Calls need this offering’s managers, and it has none',
          )}
          body={translate(
            'Steps in {calls} need them. Add offering managers here; organization owners don’t count.',
            { calls: needing.map((row) => row.call_name).join(', ') },
          )}
        />
      ) : null}
      <ProviderCallsTable
        providerUuid={providerUuid}
        offeringUuid={offeringUuid}
        title={translate('Calls this offering is in')}
      />
    </div>
  );
};

import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceResourcesCount,
  proposalMyRequestedResourcesCount,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { translate } from '@/i18n';
import { usesCallVocabulary } from '@/proposals/presentation';

/** States in which a resource is held or on its way. */
const HELD_RESOURCE_STATES = ['Creating', 'OK', 'Updating'] as const;

const countHeld = async (offeringUuid: string) => {
  const [requests, resources] = await Promise.all([
    // Requests on the user's open proposals; closed ones are left out.
    proposalMyRequestedResourcesCount({
      query: { offering_uuid: offeringUuid },
    }).then((result) => fetchResultCount(result) || 0),
    marketplaceResourcesCount({
      query: {
        offering_uuid: [offeringUuid],
        state: [...HELD_RESOURCE_STATES],
      },
    }).then((result) => fetchResultCount(result) || 0),
  ]);
  return { requests, resources };
};

/**
 * A heads-up, not a block, when the applicant already asked for the offering
 * or already has it: a second request is allowed, and often meant, but
 * should not be made by mistake.
 */
export const ExistingAccessNotice: FC<{ offeringUuid: string }> = ({
  offeringUuid,
}) => {
  const { data } = useQuery({
    queryKey: ['existing-access', offeringUuid],
    queryFn: () => countHeld(offeringUuid),
    staleTime: 60 * 1000,
  });
  if (!data || (!data.requests && !data.resources)) {
    return null;
  }
  return (
    <AlertItem
      variant="warning"
      type="floating"
      className="mb-4"
      title={
        data.resources
          ? translate('You already have this offering')
          : usesCallVocabulary()
            ? translate('You already applied for this offering')
            : translate('You already requested this offering')
      }
      body={
        data.resources
          ? translate(
              'You hold {count} resource(s) of it. Request again only if you need another one, in a new project.',
              { count: data.resources },
            )
          : usesCallVocabulary()
            ? translate(
                'It is in {count} of your open proposals. Check them under My proposals before applying again.',
                { count: data.requests },
              )
            : translate(
                'It is in {count} of your open access requests. Check them under My access requests before asking again.',
                { count: data.requests },
              )
      }
    />
  );
};

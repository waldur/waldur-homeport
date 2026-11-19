import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  OfferingTermsOfService,
  marketplaceOfferingTermsOfServiceList,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

/**
 * The offering's currently active Terms of Service, or null when none is
 * active. Only one version can be active: activating another one makes the
 * backend deactivate this one in the same request.
 */
export const getActiveTosQueryKey = (offeringUuid: string) => [
  'offeringActiveTos',
  offeringUuid,
];

export const useActiveTos = (offeringUuid: string) =>
  useQuery({
    queryKey: getActiveTosQueryKey(offeringUuid),
    queryFn: async (): Promise<OfferingTermsOfService | null> => {
      const response = await marketplaceOfferingTermsOfServiceList({
        query: { offering_uuid: offeringUuid, is_active: true },
      });
      return response?.data?.[0] ?? null;
    },
    enabled: Boolean(offeringUuid),
  });

/**
 * The version that saving would deactivate: set when the form activates a
 * configuration while a different one is active.
 */
const getReplacedTos = (
  activeTos: OfferingTermsOfService | null | undefined,
  activating: boolean,
  currentUuid?: string,
): OfferingTermsOfService | null => {
  if (!activating || !activeTos || activeTos.uuid === currentUuid) {
    return null;
  }
  return activeTos;
};

export const TosReplacementWarning: FC<{
  activeTos: OfferingTermsOfService | null | undefined;
  activating: boolean;
  currentUuid?: string;
}> = ({ activeTos, activating, currentUuid }) => {
  const replaced = getReplacedTos(activeTos, activating, currentUuid);
  if (!replaced) {
    return null;
  }
  return (
    <AlertItem
      type="floating"
      variant="warning"
      title={translate('Version {version} will be deactivated', {
        version: replaced.version,
      })}
      body={translate(
        'Only one Terms of Service version can be active at a time. Activating this version deactivates version {version}.',
        { version: replaced.version },
      )}
      className="mb-3"
    />
  );
};

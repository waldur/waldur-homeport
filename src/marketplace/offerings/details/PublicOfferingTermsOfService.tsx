import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import {
  marketplaceOfferingTermsOfServiceList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { ExternalLink } from '@/core/ExternalLink';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';

interface PublicOfferingTermsOfServiceProps {
  offering: Offering;
}

export const PublicOfferingTermsOfService: FunctionComponent<
  PublicOfferingTermsOfServiceProps
> = ({ offering }) => {
  const { data: tosData, isLoading } = useQuery({
    queryKey: ['offering-tos', offering?.uuid],
    queryFn: () =>
      marketplaceOfferingTermsOfServiceList({
        query: { offering_uuid: offering?.uuid, is_active: true },
      }).then((response) => response.data || []),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    enabled: !!offering?.uuid,
  });

  const activeTos = useMemo(() => {
    if (!tosData?.length) return null;
    return tosData.find((tos) => tos.is_active) || tosData[0];
  }, [tosData]);

  // Every state keeps the same titled card, so it does not change shape
  // when the terms arrive.
  if (isLoading) {
    return (
      <Panel
        title={translate('Terms of Service')}
        cardBordered
        className="mb-8"
      >
        <div className="text-center py-4">
          <LoadingSpinner />
        </div>
      </Panel>
    );
  }

  if (!activeTos) {
    return (
      <Panel
        title={translate('Terms of Service')}
        cardBordered
        className="mb-8"
      >
        <div className="text-center py-2.5">
          <p className="text-quaternary">
            {translate('No Terms of Service available.')}
          </p>
        </div>
      </Panel>
    );
  }

  const hasTextContent = activeTos.terms_of_service;
  const hasExternalLink = activeTos.terms_of_service_link;

  return (
    <Panel title={translate('Terms of Service')} cardBordered className="mb-8">
      {hasTextContent && (
        <SafeMarkdown text={activeTos.terms_of_service} smallTitles />
      )}

      {hasExternalLink && (
        <div className="mt-3">
          <strong>{translate('External link')}:</strong>
          <div className="mt-1.5">
            <ExternalLink
              url={activeTos.terms_of_service_link}
              label={activeTos.terms_of_service_link}
              iconless
            />
          </div>
        </div>
      )}

      {!hasTextContent && !hasExternalLink && (
        <div className="text-center py-2.5">
          <p className="text-quaternary">
            {translate('No Terms of Service content available.')}
          </p>
        </div>
      )}
    </Panel>
  );
};

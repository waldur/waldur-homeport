import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import {
  marketplaceOfferingTermsOfServiceList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { ExternalLink } from '@/core/ExternalLink';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

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

  if (isLoading) {
    return (
      <Card className="card-bordered mb-10">
        <Card.Body>
          <div className="text-center py-5">
            <LoadingSpinner />
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!activeTos) {
    return (
      <Card className="card-bordered mb-10">
        <Card.Body>
          <div className="text-center py-3">
            <p className="text-muted">
              {translate('No Terms of Service available.')}
            </p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const hasTextContent = activeTos.terms_of_service;
  const hasExternalLink = activeTos.terms_of_service_link;

  return (
    <Card className="card-bordered mb-10">
      <Card.Body>
        <PublicOfferingCardTitle>
          {translate('Terms of Service')}
        </PublicOfferingCardTitle>

        {hasTextContent && (
          <div className="tos-content-display">
            <SafeMarkdown text={activeTos.terms_of_service} />
          </div>
        )}

        {hasExternalLink && (
          <div className="mt-4">
            <strong>{translate('External link')}:</strong>
            <div className="mt-2">
              <ExternalLink
                url={activeTos.terms_of_service_link}
                label={activeTos.terms_of_service_link}
                iconless
              />
            </div>
          </div>
        )}

        {!hasTextContent && !hasExternalLink && (
          <div className="text-center py-3">
            <p className="text-muted">
              {translate('No Terms of Service content available.')}
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

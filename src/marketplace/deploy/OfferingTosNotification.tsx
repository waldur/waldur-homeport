import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { marketplaceOfferingTermsOfServiceList } from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { formatJsx, translate } from '@waldur/i18n';

import { ProviderTermsOfService } from './ProviderTermsOfService';

interface OfferingTosNotificationProps {
  offering: {
    uuid: string;
    privacy_policy_link?: string;
  };
}

export const OfferingTosNotification: FC<OfferingTosNotificationProps> = ({
  offering,
}) => {
  const { data: tosData, isLoading } = useQuery({
    queryKey: ['offering-tos', offering.uuid],
    queryFn: () =>
      marketplaceOfferingTermsOfServiceList({
        query: { offering_uuid: offering.uuid, is_active: true },
      }).then((response) => response.data),
    staleTime: STALE_TIME,
  });

  const activeTos = useMemo(() => {
    if (!tosData?.length) return null;
    return tosData.find((tos) => tos.is_active) || tosData[0];
  }, [tosData]);

  if (isLoading) {
    return null;
  }

  const hasTos =
    activeTos?.terms_of_service || activeTos?.terms_of_service_link;
  const hasPrivacyPolicy = offering.privacy_policy_link;

  if (!hasTos && !hasPrivacyPolicy) {
    return null;
  }

  if (hasTos && hasPrivacyPolicy) {
    return (
      <p className="text-center text-gray-400 fs-6 mb-0">
        {translate(
          'You also agree to the service provider’s <tos>terms of service</tos> and provider’s <pp>privacy policy</pp>.',
          {
            tos: (s: string) => (
              <ProviderTermsOfService
                termsOfService={activeTos.terms_of_service}
                termsOfServiceLink={activeTos.terms_of_service_link}
                label={s}
              />
            ),
            pp: (s: string) => (
              <ExternalLink
                url={offering.privacy_policy_link}
                label={s}
                iconless
              />
            ),
          },
          formatJsx,
        )}
      </p>
    );
  }

  if (hasTos) {
    return (
      <p className="text-center text-gray-400 fs-6 mb-0">
        {translate(
          'You also agree to the service provider’s <tos>terms of service</tos>.',
          {
            tos: (s: string) => (
              <ProviderTermsOfService
                termsOfService={activeTos.terms_of_service}
                termsOfServiceLink={activeTos.terms_of_service_link}
                label={s}
              />
            ),
          },
          formatJsx,
        )}
      </p>
    );
  }

  if (hasPrivacyPolicy) {
    return (
      <p className="text-center text-gray-400 fs-6 mb-0">
        {translate(
          'You also agree to the service provider’s <pp>privacy policy</pp>.',
          {
            pp: (s: string) => (
              <ExternalLink
                url={offering.privacy_policy_link}
                label={s}
                iconless
              />
            ),
          },
          formatJsx,
        )}
      </p>
    );
  }

  return null;
};

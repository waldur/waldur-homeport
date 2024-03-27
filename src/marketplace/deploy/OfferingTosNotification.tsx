import { ExternalLink } from '@waldur/core/ExternalLink';
import { formatJsx, translate } from '@waldur/i18n';

import { ProviderTermsOfService } from './ProviderTermsOfService';

export const OfferingTosNotification = ({ offering }) => (
  <>
    {(offering.terms_of_service || offering.terms_of_service_link) &&
    offering.privacy_policy_link ? (
      <p className="text-center fs-9 mb-0">
        {translate(
          'You also agree to the service provider’s <tos>terms of service</tos> and provider’s <pp>privacy policy</pp>.',
          {
            tos: (s: string) => (
              <ProviderTermsOfService
                termsOfService={offering.terms_of_service}
                termsOfServiceLink={offering.terms_of_service_link}
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
    ) : offering.terms_of_service || offering.terms_of_service_link ? (
      <p className="text-center fs-9 mb-0">
        {translate(
          'You also agree to the service provider’s <tos>terms of service</tos>.',
          {
            tos: (s: string) => (
              <ProviderTermsOfService
                termsOfService={offering.terms_of_service}
                termsOfServiceLink={offering.terms_of_service_link}
                label={s}
              />
            ),
          },
          formatJsx,
        )}
      </p>
    ) : offering.privacy_policy_link ? (
      <p className="text-center fs-9 mb-0">
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
    ) : null}
  </>
);

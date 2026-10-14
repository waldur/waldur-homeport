import { Tooltip } from 'waldur-ui';

import { IdentityProviderLogo } from '@/auth/providers/IdentityProviderLogo';
import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';

interface IdentityProviderIndicatorProps {
  user: {
    registration_method?: string;
    identity_provider_label?: string;
    identity_provider_management_url?: string;
  };
  hasLabel?: boolean;
  showManagementLink?: boolean;
}

export const IdentityProviderIndicator = ({
  user,
  hasLabel = false,
  showManagementLink = true,
}: IdentityProviderIndicatorProps) => (
  <div className="d-flex align-items-center">
    <Tooltip label={user.registration_method}>
      <div className="symbol symbol-circle symbol-40px img-wrapper">
        <div className="symbol-label overflow-hidden">
          <IdentityProviderLogo name={user.registration_method} />
        </div>
      </div>
    </Tooltip>
    <div className="ms-5 d-flex flex-column">
      <span className="text-quaternary hover:text-brand font-medium">
        {user.identity_provider_label}
      </span>
      {hasLabel && (
        <span className="text-quinary font-medium">
          {translate('Identity provider')}
        </span>
      )}
      {showManagementLink && user.identity_provider_management_url ? (
        <ExternalLink
          label={translate('Manage profile')}
          url={user.identity_provider_management_url}
          iconless
          className="text-anchor"
        />
      ) : null}
    </div>
  </div>
);

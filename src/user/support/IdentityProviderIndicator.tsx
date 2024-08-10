import { IdentityProviderLogo } from '@waldur/auth/providers/IdentityProviderLogo';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const IdentityProviderIndicator = ({ user, hasLabel = false }) => (
  <div className="d-flex align-items-center">
    <div className="symbol img-wrapper me-5">
      <Tip label={user.registration_method} id="registration_method_tooltip">
        <IdentityProviderLogo name={user.registration_method} />
      </Tip>
    </div>
    <div className="d-flex flex-column">
      <span className="text-grey-500 text-hover-primary fw-bold">
        {user.identity_provider_label}
      </span>
      {hasLabel && (
        <span className="text-gray-400 fw-bold">
          {translate('Identity provider')}
        </span>
      )}
      {user.identity_provider_management_url ? (
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

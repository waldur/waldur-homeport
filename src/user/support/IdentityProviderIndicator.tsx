import { IdentityProviderLogo } from '@waldur/auth/providers/IdentityProviderLogo';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const IdentityProviderIndicator = ({ user, hasLabel = false }) => (
  <div className="d-flex align-items-center">
    <Tip label={user.registration_method} id="registration_method_tooltip">
      <div className="symbol symbol-circle symbol-40px img-wrapper">
        <div className="symbol-label overflow-hidden">
          <IdentityProviderLogo name={user.registration_method} />
        </div>
      </div>
    </Tip>
    <div className="ms-5 d-flex flex-column">
      <span className="text-gray-500 text-hover-primary fw-bold">
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

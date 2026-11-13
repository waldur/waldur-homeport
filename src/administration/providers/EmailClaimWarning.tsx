import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

import { mapsEmailToUnverifiedClaim } from './oidcClaims';

/**
 * Shown when the `email` attribute is mapped to a claim the identity provider
 * does not guarantee to be the user's address. The mapped email is trusted at
 * sign-in to link accounts, accept invitations and apply email allow-lists.
 */
export const EmailClaimWarning = ({ claims }: { claims: unknown }) =>
  mapsEmailToUnverifiedClaim(claims) ? (
    <AlertItem
      type="floating"
      variant="warning"
      role="alert"
      className="mt-1.5"
      title={translate('This claim may not be a verified email address')}
      body={translate(
        'The mapped email is trusted at sign-in: it can link the login to an existing account with the same email, accept invitations sent to it, and decide whether the user may sign in at all. Map it only if the identity provider guarantees the value is the address of the user, for example a single-tenant Entra ID application whose sign-in names are the email addresses of its users.',
      )}
    />
  ) : null;

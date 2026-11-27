import { SignOutIcon } from '@phosphor-icons/react';
import Qs from 'qs';
import { FunctionComponent } from 'react';

import { getQueryString } from '@/core/utils';
import { translate } from '@/i18n';

import { explicitLogout } from '../authNavigation';

/**
 * The backend sends a failure code, never text: a message read from the URL
 * would let anyone show their own words on the portal's domain.
 */
export const getLogoutFailureMessage = (code: unknown): string => {
  switch (code) {
    case 'saml2_logout_failed':
      return translate('Remote SAML2 logout has failed.');
    case 'saml2_not_logged_in':
      return translate('You are not logged in to any identity provider.');
    case 'saml2_logout_wrong_session':
      return translate(
        'The identity provider asked to log out a different session.',
      );
    case 'saml2_logout_invalid':
      return translate('The logout message could not be processed.');
    default:
      return translate('Logout could not be completed.');
  }
};

export const AuthLogoutFailed: FunctionComponent = () => {
  const code = Qs.parse(getQueryString())?.code;

  return (
    <div className="text-center">
      <h3>{translate('Logout failed')}</h3>
      <p className="mt-2.5" data-testid="logout-failed-message">
        {getLogoutFailureMessage(code)}
      </p>
      <p className="mt-2.5">
        <button
          className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-primary inline-flex items-center gap-1.5"
          type="button"
          onClick={explicitLogout}
        >
          <SignOutIcon size={20} weight="bold" />
          {translate('Perform local logout')}
        </button>
      </p>
    </div>
  );
};

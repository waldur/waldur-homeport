import { SignOutIcon } from '@phosphor-icons/react';
import Qs from 'qs';
import { FunctionComponent } from 'react';

import { getQueryString } from '@/core/utils';
import { translate } from '@/i18n';

import { explicitLogout } from '../authNavigation';

export const AuthLogoutFailed: FunctionComponent = () => {
  const qs = Qs.parse(getQueryString());
  const message = qs?.message;

  return (
    <div className="text-center">
      <h3>{translate('Logout failed')}</h3>
      {typeof message === 'string' && <p className="mt-2.5">{message}</p>}
      <p className="mt-2.5">
        <button
          className="text-btn inline-flex items-center gap-1.5"
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

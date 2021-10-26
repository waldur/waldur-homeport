import { useRouter, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import './AuthHeader.scss';

export const AuthHeader: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  const router = useRouter();
  const sessionExpired = Boolean(router.globals.params?.toState);
  return (
    <div className="authHeader">
      {ENV.plugins.WALDUR_CORE.LOGIN_LOGO ? (
        <img src={ENV.plugins.WALDUR_CORE.LOGIN_LOGO} />
      ) : (
        <>
          <h1 className="logo-name">
            {ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
          </h1>
          {state.name === 'login' && (
            <h4>
              {translate('Welcome to {pageTitle}!', {
                pageTitle: ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE,
              })}
            </h4>
          )}
        </>
      )}
      {state.name === 'register' && (
        <h4>
          {translate('Register to')} {ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        </h4>
      )}
      <p>
        {state.name === 'register'
          ? translate('Create an account')
          : sessionExpired
          ? translate(
              'Your session has expired, please enter credentials to continue.',
            )
          : ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}
      </p>
    </div>
  );
};

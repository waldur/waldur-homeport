import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const AuthHeader = () => {
  const { state } = useCurrentStateAndParams();
  return (
    <>
      {ENV.loginLogo ? (
        <img src={ENV.loginLogo} />
      ) : (
        <>
          <h1 className="logo-name">{ENV.shortPageTitle}</h1>
          {state.name === 'login' && (
            <h4>
              {translate('Welcome to {pageTitle}!', {
                pageTitle: ENV.shortPageTitle,
              })}
            </h4>
          )}
        </>
      )}
      {state.name === 'register' && (
        <h4>
          {translate('Register to')} {ENV.shortPageTitle}
        </h4>
      )}
      <p>
        {state.name === 'register'
          ? translate('Create an account')
          : translate(
              'Your single pane of control for all cloud services. Login in to see it in action.',
            )}
      </p>
    </>
  );
};

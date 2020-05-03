import * as React from 'react';

import { translate } from '@waldur/i18n';

export const AuthButtonText = ({ mode, provider }) => {
  const prefix =
    mode === 'register'
      ? translate('Register with')
      : translate('Sign in with');
  return <>{`${prefix} ${provider}`}</>;
};

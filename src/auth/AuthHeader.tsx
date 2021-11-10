import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const AuthHeader: FunctionComponent = () => {
  const router = useRouter();
  const sessionExpired = Boolean(router.globals.params?.toState);
  return sessionExpired ? (
    <p>
      {translate(
        'Your session has expired, please enter credentials to continue.',
      )}
    </p>
  ) : null;
};

import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { RedirectStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';

export const AuthHeader: FunctionComponent = () => {
  const router = useRouter();
  // Either the transition guard sent the user here with the page they asked
  // for as a param, or a 401 mid-transition remembered that page in storage
  // before logging out (see the profile-validity hook in transitions.ts).
  const sessionExpired = Boolean(
    router.globals.params?.toState || RedirectStorage.get()?.toState,
  );
  return sessionExpired ? (
    <p>
      {translate(
        'Your session has expired, please enter credentials to continue.',
      )}
    </p>
  ) : null;
};

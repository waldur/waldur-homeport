import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

export const InvitationAccept = () => {
  const router = useRouter();
  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  useEffectOnce(() => {
    if (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED) {
      router.stateService.go('errorPage.notFound');
      return;
    }
    ngInjector.get('invitationUtilsService').checkAndAccept(uuid);
  });

  return (
    <div className="invitation-vertical-center">
      <div className="container">
        <LoadingSpinner />
        <p>{translate('Your invitation is being processed.')}</p>
        <p>{translate('You will be redirected in a moment.')}</p>
      </div>
    </div>
  );
};

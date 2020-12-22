import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { checkAndAccept } from './utils';

export const InvitationAccept: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  useEffectOnce(() => {
    if (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED) {
      router.stateService.go('errorPage.notFound');
      return;
    }
    checkAndAccept(uuid);
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

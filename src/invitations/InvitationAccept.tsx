import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { useCheckAndAccept } from './useCheckAndAccept';

export const InvitationAccept: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const { checkAndAccept } = useCheckAndAccept(uuid);

  useEffectOnce(() => {
    if (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED) {
      router.stateService.go('errorPage.notFound');
      return;
    }
    checkAndAccept();
  });

  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <LoadingSpinner />
        <p>{translate('Your invitation is being processed.')}</p>
        <p>{translate('You will be redirected in a moment.')}</p>
      </div>
    </div>
  );
};

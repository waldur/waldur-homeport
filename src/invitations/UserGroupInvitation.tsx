import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { translate } from '@/i18n';

import { useSubmitPermissionRequest } from './useSubmitPermissionRequest';

export const UserGroupInvitation: FunctionComponent = () => {
  const {
    params: { token },
  } = useCurrentStateAndParams();

  const { submit } = useSubmitPermissionRequest(token);

  useEffectOnce(() => {
    if (!ENV.plugins.WALDUR_CORE.INVITATIONS_ENABLED) {
      goToNotFound();
      return;
    }
    submit();
  });

  return (
    <div className="d-flex flex-column flex-root">
      <div className="d-flex flex-column flex-center flex-column-fluid p-10">
        <LoadingSpinner />
        <p>{translate('Your request is being processed.')}</p>
        <p>{translate('You will be redirected in a moment.')}</p>
      </div>
    </div>
  );
};

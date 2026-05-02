import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';
import { userInvitationsReject } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

export const InvitationReject: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { token },
  } = useCurrentStateAndParams();

  const { showErrorResponse, showSuccess } = useNotify();

  useEffectOnce(() => {
    async function processToken() {
      try {
        await userInvitationsReject({ body: { token } });
        showSuccess(translate('Invitation has been rejected.'));
        router.stateService.go('login');
      } catch (e) {
        showErrorResponse(e, translate('Unable to reject invitation.'));
      }
    }
    processToken();
  });

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">
        {translate('Invitation rejection')}
      </h3>
    </div>
  );
};

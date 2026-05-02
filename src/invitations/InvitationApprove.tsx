import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';
import { userInvitationsApprove } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

export const InvitationApprove: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { token },
  } = useCurrentStateAndParams();

  const { showErrorResponse, showSuccess } = useNotify();

  useEffectOnce(() => {
    async function processToken() {
      try {
        await userInvitationsApprove({ body: { token } });
        showSuccess(translate('Invitation has been approved.'));
        router.stateService.go('login');
      } catch (e) {
        showErrorResponse(e, translate('Unable to approve invitation.'));
      }
    }
    processToken();
  });

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">{translate('Invitation approval')}</h3>
    </div>
  );
};

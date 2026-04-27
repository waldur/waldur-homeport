import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';
import { userInvitationsReject } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const InvitationReject: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { token },
  } = useCurrentStateAndParams();

  const dispatch = useDispatch();

  useEffectOnce(() => {
    async function processToken() {
      try {
        await userInvitationsReject({ body: { token } });
        dispatch(showSuccess(translate('Invitation has been rejected.')));
        router.stateService.go('login');
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to reject invitation.')),
        );
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

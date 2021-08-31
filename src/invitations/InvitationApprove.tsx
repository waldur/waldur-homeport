import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { InvitationService } from './InvitationService';

export const InvitationApprove: FunctionComponent = () => {
  const router = useRouter();
  const {
    params: { token },
  } = useCurrentStateAndParams();

  const dispatch = useDispatch();

  useEffectOnce(() => {
    async function processToken() {
      try {
        await InvitationService.approve(token);
        dispatch(showSuccess(translate('Invitation has been approved.')));
        router.stateService.go('login');
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to approve invitation.')),
        );
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

import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { remoteWaldurApiPullResourceRobotAccounts } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const PullRobotAccounts = ({ resource, ...rest }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await remoteWaldurApiPullResourceRobotAccounts({
        path: { uuid: resource.uuid },
      });
      dispatch(
        showSuccess(
          translate('Pulling resource robot accounts has been scheduled.'),
        ),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to schedule pull resource robot accounts action.'),
        ),
      );
    }
  };

  return resource.offering_type === REMOTE_OFFERING_TYPE ? (
    <ActionItem
      title={translate('Pull robot accounts')}
      action={callback}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
    />
  ) : null;
};

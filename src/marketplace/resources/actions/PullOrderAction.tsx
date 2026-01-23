import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { remoteWaldurApiPullOrder } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const PullOrderAction = ({ resource, ...rest }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await remoteWaldurApiPullOrder({
        path: { uuid: resource.order_in_progress.uuid },
      });
      dispatch(
        showSuccess(translate('Pulling resource order has been scheduled.')),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to schedule pull resource order action.'),
        ),
      );
    }
  };

  return resource.offering_type === REMOTE_OFFERING_TYPE ? (
    <ActionItem
      title={translate('Pull resource order')}
      action={callback}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
    />
  ) : null;
};

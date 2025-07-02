import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceScriptSyncResource } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const SyncResourceAction = ({ resource, ...rest }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      const response = await marketplaceScriptSyncResource({
        body: {
          resource_uuid: resource.uuid,
        },
      });
      dispatch(showSuccess(response.data['detail']));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to synchronise.')));
    }
  };

  return resource.offering_type === OFFERING_TYPE_CUSTOM_SCRIPTS ? (
    <ActionItem
      title={translate('Synchronise')}
      action={callback}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  ) : null;
};

import { LinkBreakIcon } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';
import { rancherNodesUnlinkOpenstack } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

export const UnlinkAction: ActionItemType = ({ resource, refetch }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Unlink instance'),
        translate(
          'Do you want to unlink instance {name}? Unlinking will only remove object from the database, it will not trigger any cleanup',
          {
            name: resource.instance_name,
          },
        ),
      );
    } catch {
      return;
    }

    try {
      await rancherNodesUnlinkOpenstack({ path: { uuid: resource.uuid } });
      dispatch(
        showSuccess(
          translate('OpenStack instance has been unlinked from Rancher node.'),
        ),
      );
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to unlink instance from node.')),
      );
    }
  };
  if (
    resource.instance !== null &&
    user?.is_staff &&
    !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE
  ) {
    return (
      <ActionItem
        title={translate('Unlink instance')}
        action={callback}
        staff
        iconNode={<LinkBreakIcon weight="bold" />}
      />
    );
  }
  return null;
};

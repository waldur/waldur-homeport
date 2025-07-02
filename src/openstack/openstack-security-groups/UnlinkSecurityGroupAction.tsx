import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { openstackSecurityGroupsUnlink } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const UnlinkSecurityGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to unlink the security group? Unlinking will only remove object from the database, it will not trigger any cleanup',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await openstackSecurityGroupsUnlink({ path: { uuid: resource.uuid } });
    refetch();
  };
  return (
    <ActionItem
      title={translate('Unlink')}
      className="text-danger"
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      staff
    />
  );
};

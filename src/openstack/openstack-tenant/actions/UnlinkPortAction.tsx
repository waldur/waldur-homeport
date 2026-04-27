import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { openstackPortsUnlink } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const UnlinkPortAction: ActionItemType = ({ resource, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to unlink the port? Unlinking will only remove object from the database, it will not trigger any cleanup',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await openstackPortsUnlink({ path: { uuid: resource.uuid } });
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

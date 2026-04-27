import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { OpenStackRouter, openstackRoutersDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const RemoveRouterButton: ActionItemType<OpenStackRouter> = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();

  const remove = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Removing router'),
        translate('Are you sure you want to remove this router?'),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    try {
      await openstackRoutersDestroy({ path: { uuid: resource.uuid } });
      dispatch(showSuccess(translate('Router was removed.')));
      if (refetch) refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove router.')));
    }
  };
  return (
    <ActionItem
      title={translate('Remove router')}
      action={remove}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};

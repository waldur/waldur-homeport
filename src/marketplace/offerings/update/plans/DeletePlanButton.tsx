import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { marketplacePlansDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const DeletePlanButton: FunctionComponent<{ plan; refetch }> = ({
  plan,
  refetch,
}) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete plan {name}?', {
          name: plan.name,
        }),
        translate('Are you sure you would like to delete the plan?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await marketplacePlansDestroy({
        path: { uuid: plan.uuid },
      });
      await refetch();
      dispatch(showSuccess(translate('Plan has been deleted.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete plan.')));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      staff
    />
  );
};

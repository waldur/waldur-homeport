import { useSelector, useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateResourceEndDate } from '@waldur/marketplace/common/api';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const EditResourceEndDateDialog = lazyComponent(
  () => import('./EditResourceEndDateDialog'),
  'EditResourceEndDateDialog',
);

export const EditResourceEndDateAction: ActionItemType = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource,
          refetch,
          updateEndDate: updateResourceEndDate,
        },
        size: 'md',
      }),
    );

  if (!ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE) {
    return null;
  }

  return isStaff ? (
    <ActionItem title={translate('Set termination date')} action={callback} />
  ) : null;
};

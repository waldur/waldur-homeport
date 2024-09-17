import { PencilSimpleLine } from '@phosphor-icons/react';
import { useSelector, useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateResourceEndDate } from '@waldur/marketplace/common/api';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

const EditResourceEndDateDialog = lazyComponent(
  () => import('./EditResourceEndDateDialog'),
  'EditResourceEndDateDialog',
);

export const EditResourceEndDateAction: ActionItemType = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

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

  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_END_DATE,
      customerId: resource.offering_customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionItem
      title={translate('Set termination date')}
      action={callback}
      iconNode={<PencilSimpleLine />}
    />
  );
};

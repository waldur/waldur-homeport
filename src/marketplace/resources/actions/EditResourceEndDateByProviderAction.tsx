import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateResourceEndDateByProvider } from '@waldur/marketplace/common/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';

const EditResourceEndDateDialog = lazyComponent(
  () => import('./EditResourceEndDateDialog'),
  'EditResourceEndDateDialog',
);

interface EditResourceEndDateByProviderActionProps {
  resource: Resource;
  refetch?(): void;
}

export const EditResourceEndDateByProviderAction = ({
  resource,
  refetch,
}: EditResourceEndDateByProviderActionProps) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const callback = () =>
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource,
          refetch,
          updateEndDate: updateResourceEndDateByProvider,
        },
        size: 'md',
      }),
    );

  if (!ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE) {
    return null;
  }

  return hasPermission(user, {
    permission: PermissionEnum.SET_RESOURCE_END_DATE,
    customerId: resource.customer_uuid,
  }) || user.is_support ? (
    <ActionItem title={translate('Set termination date')} action={callback} />
  ) : null;
};

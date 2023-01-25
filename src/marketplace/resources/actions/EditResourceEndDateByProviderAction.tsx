import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateResourceEndDateByProvider } from '@waldur/marketplace/common/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isSupport as isSupportSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

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
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  const isSupport = useSelector(isSupportSelector);

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

  return isOwnerOrStaff || isServiceManager || isSupport ? (
    <ActionItem title={translate('Set termination date')} action={callback} />
  ) : null;
};

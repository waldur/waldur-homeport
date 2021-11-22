import { useDispatch, useSelector } from 'react-redux';

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
  () =>
    import(
      /* webpackChunkName: "EditResourceEndDateDialog" */ './EditResourceEndDateDialog'
    ),
  'EditResourceEndDateDialog',
);

interface EditResourceEndDateByProviderActionProps {
  resource: Resource;
  reInitResource?(): void;
  refreshList?(): void;
}

export const EditResourceEndDateByProviderAction = ({
  resource,
  reInitResource,
  refreshList,
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
          reInitResource,
          refreshList,
          updateEndDate: updateResourceEndDateByProvider,
        },
        size: 'md',
      }),
    );

  return isOwnerOrStaff || isServiceManager || isSupport ? (
    <ActionItem title={translate('Set termination date')} action={callback} />
  ) : null;
};

import { useSelector, useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateResourceEndDate } from '@waldur/marketplace/common/api';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const EditResourceEndDateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "EditResourceEndDateDialog" */ './EditResourceEndDateDialog'
    ),
  'EditResourceEndDateDialog',
);

interface EditResourceEndDateActionProps {
  resource: Resource;
  reInitResource?(): void;
  refreshList?(): void;
}

export const EditResourceEndDateAction = ({
  resource,
  reInitResource,
  refreshList,
}: EditResourceEndDateActionProps) => {
  const dispatch = useDispatch();
  const isStaff = useSelector(isStaffSelector);

  const callback = () =>
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource,
          reInitResource,
          refreshList,
          updateEndDate: updateResourceEndDate,
        },
        size: 'md',
      }),
    );

  return isStaff ? (
    <ActionItem title={translate('Edit end date')} action={callback} />
  ) : null;
};

import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { ACTIVE, DRAFT, PAUSED } from '../../store/constants';
import { RowEditButton } from '../RowEditButton';

const UpdateOfferingLogoDialog = lazyComponent(
  () => import('../../actions/UpdateOfferingLogoDialog'),
  'UpdateOfferingLogoDialog',
);

export const OfferingLogoButton: FC<{ offering; refetch }> = (props) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UpdateOfferingLogoDialog, {
        resolve: props,
      }),
    );
  if (
    user.is_staff ||
    ([DRAFT, ACTIVE, PAUSED].includes(props.offering.state) &&
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_OFFERING_THUMBNAIL,
        customerId: customer.uuid,
      }))
  )
    return <RowEditButton onClick={callback} size="sm" />;
  return null;
};

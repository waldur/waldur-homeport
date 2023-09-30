import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { ACTIVE, DRAFT, PAUSED } from '../../store/constants';

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
    return (
      <Button onClick={callback} size="sm" className="me-3">
        <i className="fa fa-pencil" /> {translate('Edit')}
      </Button>
    );
  return null;
};

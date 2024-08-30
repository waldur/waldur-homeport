import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const OfferingCreateDialog = lazyComponent(
  () => import('../actions/OfferingCreateDialog'),
  'OfferingCreateDialog',
);

export const CreateOfferingButton = ({ fetch }: { fetch? }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);

  const callback = () => {
    dispatch(openModalDialog(OfferingCreateDialog, { resolve: { fetch } }));
  };

  if (
    customer?.is_service_provider &&
    hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING,
      customerId: customer.uuid,
    })
  ) {
    return <AddButton action={callback} />;
  } else {
    return null;
  }
};

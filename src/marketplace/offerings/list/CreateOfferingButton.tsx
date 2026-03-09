import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

const OfferingCreateDialog = lazyComponent(() =>
  import('../actions/OfferingCreateDialog').then((module) => ({
    default: module.OfferingCreateDialog,
  })),
);

export const CreateOfferingButton = ({
  fetch,
  className,
  showProvider = false,
}: {
  fetch?;
  className?;
  showProvider?: boolean;
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useUser();

  const callback = () => {
    dispatch(
      openModalDialog(OfferingCreateDialog, {
        resolve: { fetch, showProvider },
      }),
    );
  };

  if (
    user.is_staff ||
    (customer?.is_service_provider &&
      hasPermission(user, {
        permission: PermissionEnum.CREATE_OFFERING,
        customerId: customer.uuid,
      }))
  ) {
    return (
      <AddButton
        action={callback}
        className={className}
        data-testid="offering-add-btn"
      />
    );
  } else {
    return null;
  }
};

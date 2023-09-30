import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const CreateOfferingUserDialog = lazyComponent(
  () => import('./CreateOfferingUserDialog'),
  'CreateOfferingUserDialog',
);

export const CreateOfferingUserButton = ({ offering, onSuccess }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!offering.secret_options.service_provider_can_create_offering_user) {
    return null;
  }
  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_USER,
      customerId: offering.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Create')}
      icon="fa fa-plus"
      action={() =>
        dispatch(
          openModalDialog(CreateOfferingUserDialog, {
            resolve: { offering, onSuccess },
          }),
        )
      }
    />
  );
};

import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { PermissionEnum, hasPermission } from '@waldur/core/permissions';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
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

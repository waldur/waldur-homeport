import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

const CreateOfferingUserDialog = lazyComponent(() =>
  import('./CreateOfferingUserDialog').then((module) => ({
    default: module.CreateOfferingUserDialog,
  })),
);

export const CreateOfferingUserButton = ({ offering, onSuccess }) => {
  const dispatch = useDispatch();
  const user = useUser();
  if (!offering.plugin_options?.service_provider_can_create_offering_user) {
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
      iconNode={<PlusCircleIcon weight="bold" />}
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

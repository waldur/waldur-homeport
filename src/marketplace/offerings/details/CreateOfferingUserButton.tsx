import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

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

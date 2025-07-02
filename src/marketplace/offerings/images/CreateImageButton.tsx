import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

const CreateImageDialog = lazyComponent(() =>
  import('./CreateImageDialog').then((module) => ({
    default: module.CreateImageDialog,
  })),
);

interface CreateImageButtonProps {
  offering: Offering;
  refetch(): void;
}

export const CreateImageButton = (props: CreateImageButtonProps) => {
  const user = useUser();
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(CreateImageDialog, {
        resolve: props,
      }),
    );

  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_SCREENSHOT,
      customerId: props.offering.customer_uuid,
    }) ||
    props.offering.type === REMOTE_OFFERING_TYPE
  ) {
    return null;
  }

  return (
    <ActionButton
      title={translate('Add image')}
      iconNode={<PlusCircleIcon weight="bold" />}
      action={callback}
    />
  );
};

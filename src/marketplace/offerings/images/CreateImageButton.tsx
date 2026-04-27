import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

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

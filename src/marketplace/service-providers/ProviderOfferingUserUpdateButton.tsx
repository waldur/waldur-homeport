import { ChatTeardropTextIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { ServiceProvider } from '../types';

import { ProviderOfferingUserUpdateDialogProps } from './ProviderOfferingUserUpdateDialog';

const ProviderOfferingUserUpdateDialog = lazyComponent(() =>
  import('./ProviderOfferingUserUpdateDialog').then((module) => ({
    default: module.ProviderOfferingUserUpdateDialog,
  })),
);

export const ProviderOfferingUserUpdateButton: FC<
  ProviderOfferingUserUpdateDialogProps['resolve'] & {
    provider?: ServiceProvider;
    offering?: PublicOfferingDetails;
  }
> = (props) => {
  const { openDialog } = useModal();
  const user = useUser();
  const canUpdateOfferingUser = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_USER,
    customerId: props.provider
      ? props.provider.customer_uuid
      : props.offering
        ? props.offering.customer_uuid
        : props.row.customer_uuid, // Use row's customer_uuid for admin context
  });

  const icon =
    props.updateScope === 'comment' ? (
      <ChatTeardropTextIcon weight="bold" />
    ) : (
      <PencilSimpleIcon weight="bold" />
    );

  return (
    canUpdateOfferingUser && (
      <ActionItem
        title={
          props.updateScope === 'comment'
            ? translate('Edit comment')
            : props.updateScope === 'state'
              ? translate('Update account state')
              : translate('Edit external username')
        }
        action={() =>
          openDialog(ProviderOfferingUserUpdateDialog, {
            resolve: props,
            size: 'lg',
          })
        }
        iconNode={icon}
      />
    )
  );
};

import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const CampaignDialog = lazyComponent(() =>
  import('./CampaignDialog').then((module) => ({
    default: module.CampaignDialog,
  })),
);

export const CampaignCreateButton: FunctionComponent<{
  refetch;
  customerId: string;
}> = ({ refetch, customerId }) => {
  const { openDialog } = useModal();
  const user = useUser();
  const callback = () =>
    openDialog(CampaignDialog, {
      dialogClassName: 'modal-dialog-centered',
      resolve: {
        refetch,
      },
      size: 'lg',
    });
  // Support may create campaigns on the API without holding a role.
  if (
    !user?.is_support &&
    !hasPermission(user, {
      permission: PermissionEnum.MANAGE_CAMPAIGN,
      customerId,
    })
  ) {
    return null;
  }
  return (
    <BaseButton
      onClick={callback}
      label={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};

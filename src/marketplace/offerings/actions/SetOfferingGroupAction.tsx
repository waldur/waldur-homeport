import { StackIcon } from '@phosphor-icons/react';
import { ProviderOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const SetOfferingGroupDialog = lazyComponent(() =>
  import('./SetOfferingGroupDialog').then((module) => ({
    default: module.SetOfferingGroupDialog,
  })),
);

interface SetOfferingGroupActionProps {
  row: ProviderOffering;
  refetch: () => void;
}

export const SetOfferingGroupAction = ({
  row,
  refetch,
}: SetOfferingGroupActionProps) => {
  const user = useUser();
  const { openDialog } = useModal();

  const canUpdateOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid,
  });
  if (!canUpdateOffering) {
    return null;
  }

  const callback = () =>
    openDialog(SetOfferingGroupDialog, {
      resolve: {
        offering: row,
        initialGroup: row.offering_group_uuid
          ? {
              uuid: row.offering_group_uuid,
              title: row.offering_group_title ?? row.offering_group_uuid,
            }
          : null,
        refetch,
      },
    });

  return (
    <ActionItem
      title={translate('Set offering group')}
      action={callback}
      iconNode={<StackIcon weight="bold" />}
    />
  );
};

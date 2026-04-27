import { BookOpenTextIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { ActionButton } from '@/table/ActionButton';

const SetManagementSecurityGroupDialog = lazyComponent(() =>
  import('./SetManagementSecurityGroupDialog').then((module) => ({
    default: module.SetManagementSecurityGroupDialog,
  })),
);

export const SetManagementSecurityGroupButton = ({ clusterId }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Set management security group')}
      action={() =>
        openDialog(SetManagementSecurityGroupDialog, {
          size: 'lg',
          clusterId,
        })
      }
      iconNode={<BookOpenTextIcon weight="bold" />}
    />
  );
};

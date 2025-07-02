import { BookOpenTextIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

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
      iconNode={<BookOpenTextIcon />}
    />
  );
};

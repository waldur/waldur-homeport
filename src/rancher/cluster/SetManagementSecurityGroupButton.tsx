import { BookOpenTextIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const SetManagementSecurityGroupDialog = lazyComponent(() =>
  import('./SetManagementSecurityGroupDialog').then((module) => ({
    default: module.SetManagementSecurityGroupDialog,
  })),
);

export const SetManagementSecurityGroupButton = ({ clusterId }) => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      label={translate('Set management security group')}
      onClick={() =>
        openDialog(SetManagementSecurityGroupDialog, {
          size: 'lg',
          clusterId,
        })
      }
      iconNode={<BookOpenTextIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};

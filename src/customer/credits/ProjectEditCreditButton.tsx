import { PencilSimpleIcon } from '@phosphor-icons/react';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const ProjectCreditDialog = lazyComponent(() =>
  import('./ProjectCreditDialog').then((module) => ({
    default: module.ProjectCreditDialog,
  })),
);

export const ProjectEditCreditButton = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const openCreditFormDialog = () =>
    openDialog(ProjectCreditDialog, {
      size: 'lg',
      resolve: {
        credit: row,
        refetch,
      },
    });

  return (
    <Menu.Item
      icon={<PencilSimpleIcon weight="bold" />}
      onSelect={openCreditFormDialog}
    >
      {translate('Edit')}
    </Menu.Item>
  );
};

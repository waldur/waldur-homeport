import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

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
    <ActionsDropdownItem onSelect={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit')}
    </ActionsDropdownItem>
  );
};

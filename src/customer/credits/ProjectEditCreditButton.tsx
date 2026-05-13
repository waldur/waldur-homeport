import { PencilSimpleIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';

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
    <Dropdown.Item as="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};

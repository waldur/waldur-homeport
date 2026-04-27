import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ArrowImportWizard = lazyComponent(() =>
  import('./import/ArrowImportWizard').then((module) => ({
    default: module.ArrowImportWizard,
  })),
);

interface ArrowResourceImportButtonProps {
  refetch?: () => void;
}

export const ArrowResourceImportButton = ({
  refetch,
}: ArrowResourceImportButtonProps) => {
  const dispatch = useDispatch();

  const openDialog = () => {
    dispatch(
      openModalDialog(ArrowImportWizard, {
        resolve: { refetch },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionButton
      title={translate('Import')}
      action={openDialog}
      iconNode={<DownloadSimpleIcon weight="bold" />}
    />
  );
};

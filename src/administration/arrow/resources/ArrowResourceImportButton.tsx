import { DownloadSimpleIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
  const { openDialog: openModal } = useModal();

  const openDialog = () => {
    openModal(ArrowImportWizard, {
      resolve: { refetch },
      size: 'lg',
    });
  };

  return (
    <BaseButton
      label={translate('Import')}
      onClick={openDialog}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};

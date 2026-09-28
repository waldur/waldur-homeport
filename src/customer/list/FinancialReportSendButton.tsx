import { ShareIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const ExportAsEmailDialog = lazyComponent(() =>
  import('./ExportAsEmailDialog').then((module) => ({
    default: module.ExportAsEmailDialog,
  })),
);

export const FinancialReportSendButton = () => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      onClick={() => openDialog(ExportAsEmailDialog)}
      label={translate('Send')}
      iconNode={<ShareIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};

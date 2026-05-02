import { ShareIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ExportAsEmailDialog = lazyComponent(() =>
  import('./ExportAsEmailDialog').then((module) => ({
    default: module.ExportAsEmailDialog,
  })),
);

export const FinancialReportSendButton = () => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      action={() => openDialog(ExportAsEmailDialog)}
      title={translate('Send')}
      iconNode={<ShareIcon weight="bold" />}
    />
  );
};

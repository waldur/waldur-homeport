import { ShareIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ExportAsEmailDialog = lazyComponent(() =>
  import('./ExportAsEmailDialog').then((module) => ({
    default: module.ExportAsEmailDialog,
  })),
);

export const FinancialReportSendButton = () => {
  const dispatch = useDispatch();

  return (
    <ActionButton
      action={() => dispatch(openModalDialog(ExportAsEmailDialog))}
      title={translate('Send')}
      iconNode={<ShareIcon weight="bold" />}
    />
  );
};

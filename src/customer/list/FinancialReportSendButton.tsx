import { ShareIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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

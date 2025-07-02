import { ShareIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ExportAsEmailDialog = lazyComponent(() =>
  import('./ExportAsEmailDialog').then((module) => ({
    default: module.ExportAsEmailDialog,
  })),
);

export const FinancialReportSendButton = () => {
  const dispatch = useDispatch();

  return (
    <Button
      onClick={() => dispatch(openModalDialog(ExportAsEmailDialog))}
      variant="outline-default"
      className="btn-outline"
    >
      <span className="svg-icon svg-icon-2">
        <ShareIcon />
      </span>{' '}
      {translate('Send')}
    </Button>
  );
};

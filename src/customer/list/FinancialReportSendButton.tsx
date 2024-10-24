import { Share } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ExportAsEmailDialog = lazyComponent(
  () => import('./ExportAsEmailDialog'),
  'ExportAsEmailDialog',
);

export const FinancialReportSendButton = () => {
  const dispatch = useDispatch();

  return (
    <Button
      onClick={() => dispatch(openModalDialog(ExportAsEmailDialog))}
      variant="light"
    >
      <span className="svg-icon svg-icon-2">
        <Share />
      </span>{' '}
      {translate('Send')}
    </Button>
  );
};

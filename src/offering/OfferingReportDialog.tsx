import * as React from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { OfferingReportComponent } from './OfferingReportComponent';
import { Report } from './types';

interface OfferingReportDialogProps {
  resolve: {
    report: Report;
  };
}

export const OfferingReportDialog = (props: OfferingReportDialogProps) => (
  <ModalDialog
    title={translate('Report details')}
    footer={<CloseDialogButton />}
  >
    <OfferingReportComponent report={props.resolve.report} />
  </ModalDialog>
);

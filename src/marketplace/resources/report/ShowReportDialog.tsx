import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Report } from '@waldur/marketplace/resources/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ShowReportComponent } from './ShowReportComponent';

interface ShowReportDialogProps {
  resolve: {
    report: Report;
  };
}

export const ShowReportDialog: FunctionComponent<ShowReportDialogProps> = (
  props,
) => (
  <ModalDialog
    title={translate('Report details')}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    <ShowReportComponent report={props.resolve.report} />
  </ModalDialog>
);

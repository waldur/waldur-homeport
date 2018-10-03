import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingReportComponent } from './OfferingReportComponent';
import { Report } from './types';

interface OfferingReportDialogProps extends TranslateProps {
  resolve: {
    report: Report;
  };
}

const OfferingReportDialog = (props: OfferingReportDialogProps) => (
  <ModalDialog
    title={props.translate('Report details')}
    footer={<CloseDialogButton />}
  >
    <OfferingReportComponent report={props.resolve.report}/>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(OfferingReportDialog), ['resolve']);

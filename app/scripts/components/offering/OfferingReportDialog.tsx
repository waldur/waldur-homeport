import * as React from 'react';
import * as Accordion from 'react-bootstrap/lib/Accordion';
import * as Panel from 'react-bootstrap/lib/Panel';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface ReportSection {
  header: string;
  body: string;
}

type Report = ReportSection[];

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
    <Accordion>
      {props.resolve.report.map((section, index) => (
        <Panel header={section.header} eventKey={index} key={index}>
          <pre>{section.body}</pre>
        </Panel>
      ))}
    </Accordion>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(OfferingReportDialog), ['resolve']);

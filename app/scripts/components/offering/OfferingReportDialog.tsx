import * as React from 'react';
import * as Accordion from 'react-bootstrap/lib/Accordion';
import * as Panel from 'react-bootstrap/lib/Panel';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface OfferingReportDialogProps extends TranslateProps {
  resolve: {
    report: object
  };
}

const OfferingReportDialog = (props: OfferingReportDialogProps) => (
  <ModalDialog
    title={props.translate('Report details')}
    footer={<CloseDialogButton />}
  >
    <Accordion>
      {Object.keys(props.resolve.report).map((key, index) => (
        <Panel header={key} eventKey={index} key={index}>
          <pre>{JSON.stringify(props.resolve.report[key])}</pre>
        </Panel>
      ))}
    </Accordion>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(OfferingReportDialog), ['resolve']);

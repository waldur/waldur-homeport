import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { ZabbixHostSummary } from './ZabbixHostSummary';

const MonitoringDetailsDialog = props => (
  <ModalDialog title={props.translate('Monitoring details')} footer={<CloseDialogButton/>}>
    <dl className="dl-horizontal">
      <ZabbixHostSummary resource={props.resolve.resource} translate={props.translate}/>
    </dl>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(MonitoringDetailsDialog), ['resolve']);

import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { ZabbixHostSummary } from './ZabbixHostSummary';

const MonitoringDetailsDialog = props => (
  <ModalDialog title={props.translate('Monitoring details')} footer={<CloseDialogButton/>}>
    <Tabs defaultActiveKey={1} id="monitoringDetails">
      <Tab eventKey={1} title={props.translate('Details')}>
        <div className="row m-t-md">
          <dl className="dl-horizontal resource-details-table col-sm-12">
            <ZabbixHostSummary resource={props.resolve.resource} translate={props.translate}/>
          </dl>
        </div>
      </Tab>
      <Tab eventKey={2} title={props.translate('Charts')}>
        TODO.
      </Tab>
    </Tabs>
  </ModalDialog>
);

export default connectAngularComponent(withTranslation(MonitoringDetailsDialog), ['resolve']);

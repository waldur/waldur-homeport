import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const TelemetryExampleDialog: FunctionComponent = () => (
  <ModalDialog
    title={translate('Example telemetry metrics')}
    footer={
      <div className="flex-grow-1 d-flex justify-content-between">
        <CloseDialogButton label={translate('Close')} />
      </div>
    }
  >
    <p>
      <strong>{translate('Deployment ID')}:</strong> 0f115db062b7c0dd030b16878c7
    </p>
    <p>
      <strong>{translate('Deployment type')}:</strong> other
    </p>
    <p>
      <strong>{translate('Helpdesk backend')}:</strong> zammad
    </p>
    <p>
      <strong>{translate('Helpdesk integration status')}:</strong> true
    </p>
    <p>
      <strong>{translate('Number of users')}:</strong> 1555
    </p>
    <p>
      <strong>{translate('Number of offerings')}:</strong> 796
    </p>
    <p>
      <strong>{translate('Types of offering')}:</strong>
    </p>
    <ul>
      <li>Waldur.RemoteOffering</li>
      <li>Marketplace.Booking</li>
      <li>Marketplace.Rancher</li>
      <li>OpenStack.Volume</li>
      <li>VMware.VirtualMachine</li>
      <li>Marketplace.Basic</li>
    </ul>
    <p>
      <strong>{translate('Version')}:</strong> 6.6.5+3.g6491c9dab.dirty
    </p>
    <p>
      <strong>{translate('Installation date')}:</strong> 2022-06-10
      11:28:50.585100+0000
    </p>
  </ModalDialog>
);

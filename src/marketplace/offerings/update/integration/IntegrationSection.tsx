import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  getPluginOptionsForm,
  getSecretOptionsForm,
} from '@waldur/marketplace/common/registry';
import { getServiceSettingsForm } from '@waldur/providers/registry';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { EditIntegrationButton } from './EditIntegrationButton';
import { EditSchedulesButton } from './EditSchedulesButton';
import { GoogleCalendarActions } from './GoogleCalendarActions';
import { OfferingAttributes } from './OfferingAttributes';
import { RemoteActions } from './RemoteActions';
import { ScriptIntegrationSummary } from './ScriptIntegrationSummary';
import { SyncButton } from './SyncButton';

export const IntegrationSection: FC<OfferingSectionProps> = (props) => {
  if (props.offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS) {
    return (
      <ScriptIntegrationSummary
        offering={props.offering}
        refetch={props.refetch}
        loading={props.loading}
      />
    );
  }

  const ServiceSettingsForm = getServiceSettingsForm(props.offering.type);
  const SecretOptionsForm = getSecretOptionsForm(props.offering.type);
  const PluginOptionsForm = getPluginOptionsForm(props.offering.type);

  if (!ServiceSettingsForm && !SecretOptionsForm && !PluginOptionsForm) {
    return null;
  }

  return (
    <Card className="mb-10" id="integration">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          <span className="me-2">{translate('Integration')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </div>
        <div className="card-toolbar">
          <EditIntegrationButton
            offering={props.offering}
            refetch={props.refetch}
          />
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
          <GoogleCalendarActions offering={props.offering} />
          <SyncButton offering={props.offering} refetch={props.refetch} />
        </div>
      </div>
      <Card.Body>
        <OfferingAttributes offering={props.offering} />
      </Card.Body>
    </Card>
  );
};

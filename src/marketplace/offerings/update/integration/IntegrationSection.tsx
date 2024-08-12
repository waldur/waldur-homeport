import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  getPluginOptionsForm,
  getSecretOptionsForm,
} from '@waldur/marketplace/common/registry';
import { EditLexisLinkIntegrationButton } from '@waldur/marketplace/offerings/update/integration/EditLexisLinkIntegrationButton';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { EditIntegrationButton } from './EditIntegrationButton';
import { EditSchedulesButton } from './EditSchedulesButton';
import { GoogleCalendarActions } from './GoogleCalendarActions';
import { OfferingAttributes } from './OfferingAttributes';
import { getServiceSettingsForm } from './registry';
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
    <Card>
      <Card.Header className="border-2 border-bottom">
        <Card.Title className="h5">
          <span className="me-2">{translate('Integration')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
        <div className="card-toolbar gap-3">
          {isFeatureVisible(MarketplaceFeatures.lexis_links) ? (
            <EditLexisLinkIntegrationButton
              offering={props.offering}
              refetch={props.refetch}
            />
          ) : null}
          <EditIntegrationButton
            offering={props.offering}
            refetch={props.refetch}
          />
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
          <GoogleCalendarActions offering={props.offering} />
          <SyncButton offering={props.offering} refetch={props.refetch} />
        </div>
      </Card.Header>
      <Card.Body>
        <OfferingAttributes offering={props.offering} />
      </Card.Body>
    </Card>
  );
};

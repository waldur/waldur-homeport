import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  getAttributes,
  getOptionsSummary,
  getPluginOptionsForm,
  getProviderType,
  getSecretOptionsForm,
} from '@waldur/marketplace/common/registry';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { Section } from '@waldur/marketplace/types';
import {
  getSerializer,
  getServiceSettingsForm,
} from '@waldur/providers/registry';

import { EditIntegrationButton } from './EditIntegrationButton';
import { EditSchedulesButton } from './EditSchedulesButton';
import { GoogleCalendarActions } from './GoogleCalendarActions';
import { RemoteActions } from './RemoteActions';
import { ScriptIntegrationSummary } from './ScriptIntegrationSummary';

export const IntegrationSection = (props) => {
  if (props.offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS) {
    return (
      <ScriptIntegrationSummary
        offering={props.offering}
        refetch={props.refetch}
      />
    );
  }
  const OptionsSummary = getOptionsSummary(props.offering.type);

  const section: Section = {
    key: 'management',
    title: translate('Management'),
    attributes: [...getAttributes(props.offering.type), ...OptionsSummary],
  };
  const providerType = getProviderType(props.offering.type);
  const serializer = getSerializer(providerType);
  const attributes = props.provider ? serializer(props.provider.options) : {};

  const ServiceSettingsForm = getServiceSettingsForm(props.offering.type);
  const SecretOptionsForm = getSecretOptionsForm(props.offering.type);
  const PluginOptionsForm = getPluginOptionsForm(props.offering.type);

  if (!ServiceSettingsForm && !SecretOptionsForm && !PluginOptionsForm) {
    return null;
  }

  return (
    <Card className="mb-10">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">{translate('Integration')}</div>
        <div className="card-toolbar">
          <EditIntegrationButton
            offering={props.offering}
            provider={props.provider}
            refetch={props.refetch}
          />
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
          <GoogleCalendarActions offering={props.offering} />
        </div>
      </div>
      <Card.Body>
        {attributes && (
          <AttributesTable
            attributes={{
              ...attributes,
              ...props.offering.plugin_options,
              ...props.offering.secret_options,
            }}
            sections={[section]}
          />
        )}
      </Card.Body>
    </Card>
  );
};

import { translate } from '@waldur/i18n';
import {
  getAttributes,
  getOptionsSummary,
  getProviderType,
} from '@waldur/marketplace/common/registry';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { Section } from '@waldur/marketplace/types';
import { getSerializer } from '@waldur/marketplace/offerings/update/integration/registry';

export const OfferingAttributes = ({ offering }) => {
  const OptionsSummary = getOptionsSummary(offering.type);

  const section: Section = {
    key: 'management',
    title: translate('Management'),
    attributes: [
      {
        key: 'auto_approve_in_service_provider_projects',
        title: translate('Auto approve in service provider projects'),
        type: 'boolean',
      },
      {
        key: 'service_provider_can_create_offering_user',
        title: translate('Allow service provider to create offering users'),
        type: 'boolean',
      },
      ...getAttributes(offering.type),
      ...OptionsSummary,
    ],
  };
  const providerType = getProviderType(offering.type);
  const serializer = getSerializer(providerType);
  const attributes = offering.service_attributes
    ? serializer(offering.service_attributes)
    : {};

  return attributes ? (
    <AttributesTable
      attributes={{
        ...attributes,
        ...offering.plugin_options,
        ...offering.secret_options,
      }}
      sections={[section]}
    />
  ) : null;
};

import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { MarketplaceResourceStateField } from '@waldur/marketplace/resources/list/MarketplaceResourceStateField';
import { Resource } from '@waldur/marketplace/resources/types';
import { Field } from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';

interface SupportDetailsTableProps {
  resource: Resource;
}

export const SupportDetailsTable: FunctionComponent<SupportDetailsTableProps> =
  ({ resource }) => (
    <ResourceDetailsTable>
      <Field label={translate('State')}>
        <MarketplaceResourceStateField resource={resource} />
      </Field>

      <Field label={translate('Name')}>{resource.name}</Field>

      <Field label={translate('Created')}>
        {formatDateTime(resource.created)}
      </Field>

      <Field label={translate('Offering')}>{resource.offering_name}</Field>

      {resource.provider_name && (
        <Field label={translate('Provider')} value={resource.provider_name} />
      )}

      {resource.backend_id && (
        <Field
          label={translate('Backend ID')}
          valueClass="ellipsis"
          helpText={translate('Unique ID of a resource in a backend system')}
        >
          {resource.backend_id}
        </Field>
      )}
    </ResourceDetailsTable>
  );

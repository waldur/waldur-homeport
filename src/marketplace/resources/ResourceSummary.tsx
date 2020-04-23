import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { CreatedField } from '@waldur/resource/summary/CreatedField';

import { KeyValueButton } from './KeyValueButton';
import { MarketplaceResourceStateField } from './list/MarketplaceResourceStateField';
import { ResourceDetailsLink } from './ResourceDetailsLink';
import { Resource } from './types';

export const ResourceSummary = ({ resource }) => (
  <dl className="dl-horizontal resource-details-table">
    <Field label={translate('Offering type')} value={resource.offering_name} />
    <Field
      label={translate('Client organization')}
      value={resource.customer_name}
    />
    <Field label={translate('Client project')} value={resource.project_name} />
    <Field label={translate('Category')} value={resource.category_title} />
    <Field label={translate('Plan')} value={resource.plan_name || 'N/A'} />
    <Field
      label={translate('State')}
      value={<MarketplaceResourceStateField resource={resource as Resource} />}
    />
    <Field
      label={translate('Created')}
      value={<CreatedField resource={resource} />}
    />
    <Field
      label={translate('UUID')}
      value={resource.uuid}
      valueClass="ellipsis"
    />
    <Field
      label={translate('Attributes')}
      value={
        Object.keys(resource.attributes).length > 0 && (
          <KeyValueButton items={resource.attributes} />
        )
      }
    />
    <Field
      label={translate('Resource')}
      value={
        <ResourceDetailsLink item={resource}>
          {translate('Resource link')}
        </ResourceDetailsLink>
      }
    />
  </dl>
);

import * as React from 'react';

import { getUUID } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';
import { formatDefault } from '@waldur/resource/utils';

import { Network } from './types';

const formatTenant = props => (
  <ResourceLink
    type="OpenStack.Tenant"
    uuid={getUUID(props.tenant)}
    label={props.tenant_name}
  />
);

const PureOpenStackNetworkSummary = (props: ResourceSummaryProps<Network>) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Tenant')} value={formatTenant(resource)} />
      <Field
        label={translate('Type')}
        value={formatDefault(resource.type)}
        valueClass="ellipsis"
      />
      <Field
        label={translate('Segmentation ID')}
        value={formatDefault(resource.segmentation_id)}
      />
      <Field
        label={translate('Is external')}
        value={resource.is_external ? translate('Yes') : translate('No')}
      />
    </span>
  );
};

export const OpenStackNetworkSummary = withTranslation(
  PureOpenStackNetworkSummary,
);

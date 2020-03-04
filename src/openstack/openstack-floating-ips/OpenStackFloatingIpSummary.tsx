import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';

const formatTenant = props => (
  <ResourceLink
    type="OpenStack.Tenant"
    uuid={props.tenant_uuid}
    label={props.tenant_name}
  />
);

const PureOpenStackFloatingIpSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Tenant')} value={formatTenant(props.resource)} />
      <Field label={translate('Address')} value={resource.address} />
      <Field
        label={translate('Runtime state')}
        value={resource.runtime_state}
      />
    </span>
  );
};

export const OpenStackFloatingIpSummary = withTranslation(
  PureOpenStackFloatingIpSummary,
);

import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

const ManageSecurityGroupsButton = props => (
  <Link
    state="resources.details"
    params={{
      resource_type: 'OpenStack.Tenant',
      uuid: props.resource.tenant_uuid,
      tab: 'security_groups',
    }}
    className="btn btn-sm btn-default"
  >
    <i className="fa fa-shield" /> {translate('Manage security groups')}
  </Link>
);

const ManageNetworksButton = props => (
  <Link
    state="resources.details"
    params={{
      resource_type: 'OpenStack.Tenant',
      uuid: props.resource.tenant_uuid,
      tab: 'networks',
    }}
    className="btn btn-sm btn-default"
  >
    <i className="fa fa-server" /> {translate('Manage networks')}
  </Link>
);

export const OpenStackInstanceTenantButton = props =>
  props.resource.tenant_uuid ? (
    <>
      <ManageSecurityGroupsButton resource={props.resource} />{' '}
      <ManageNetworksButton resource={props.resource} />{' '}
    </>
  ) : null;

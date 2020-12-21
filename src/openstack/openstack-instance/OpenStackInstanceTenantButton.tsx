import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

const ManageSecurityGroupsButton: FunctionComponent<any> = (props) => (
  <Link
    state="resource-details"
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

const ManageNetworksButton: FunctionComponent<any> = (props) => (
  <Link
    state="resource-details"
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

export const OpenStackInstanceTenantButton: FunctionComponent<any> = (props) =>
  props.resource.tenant_uuid ? (
    <>
      <ManageSecurityGroupsButton resource={props.resource} />{' '}
      <ManageNetworksButton resource={props.resource} />{' '}
    </>
  ) : null;

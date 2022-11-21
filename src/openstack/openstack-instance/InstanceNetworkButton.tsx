import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const InstanceNetworkButton: FunctionComponent<{
  state;
  resource;
}> = ({ state, resource }) => (
  <>
    <Link
      state={state.name}
      params={{
        resource_uuid: resource.parent_uuid,
        tab: 'security_groups',
      }}
      className="btn btn-secondary me-3"
    >
      <i className="fa fa-shield" /> {translate('Manage security groups')}
    </Link>{' '}
    <Link
      state={state.name}
      params={{
        resource_uuid: resource.parent_uuid,
        tab: 'networks',
      }}
      className="btn btn-secondary me-3"
    >
      <i className="fa fa-server" /> {translate('Manage networks')}
    </Link>
  </>
);

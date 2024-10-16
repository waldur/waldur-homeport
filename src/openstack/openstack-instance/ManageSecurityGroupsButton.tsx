import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const ManageSecurityGroupsButton: FunctionComponent<any> = (props) =>
  props.resource.parent_uuid ? (
    <Link
      state="marketplace-resource-details"
      params={{
        resource_uuid: props.resource.parent_uuid,
        tab: 'security_groups',
      }}
      className="ms-3 btn btn-light"
    >
      {translate('Manage security groups')}
    </Link>
  ) : null;

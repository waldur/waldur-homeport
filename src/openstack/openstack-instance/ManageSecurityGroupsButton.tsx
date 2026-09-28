import { FunctionComponent } from 'react';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

export const ManageSecurityGroupsButton: FunctionComponent<any> = (props) =>
  props.resource.parent_uuid ? (
    <Link
      state="marketplace-resource-details"
      params={{
        resource_uuid: props.resource.parent_uuid,
        tab: 'security_groups',
      }}
      buttonVariant="tertiary"
      buttonSize="lg"
      className="ms-3"
    >
      {translate('Manage security groups')}
    </Link>
  ) : null;

import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

import { OpenStackSecurityGroupsTable } from '../openstack-security-groups/OpenStackSecurityGroupsDialog';
import { SecurityGroup } from '../openstack-security-groups/types';

import { UpdateSecurityGroupsButton } from './actions/update-security-groups/UpdateSecurityGroupsButton';
import { ManageSecurityGroupsButton } from './ManageSecurityGroupsButton';

interface OwnProps {
  resourceScope: {
    security_groups: SecurityGroup[];
  };
  resource;
  refetch?(): void;
  isLoading?: boolean;
}

export const OpenStackSecurityGroupsList: FunctionComponent<OwnProps> = (
  props,
) => {
  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          {translate('Security groups details')}
          <RefreshButton refetch={props.refetch} loading={props.isLoading} />
        </Card.Title>
        <div className="card-toolbar">
          <UpdateSecurityGroupsButton
            resource={props.resourceScope}
            refetch={props.refetch}
          />
          <ManageSecurityGroupsButton resource={props.resource} />
        </div>
      </Card.Header>
      <Card.Body>
        {props.resourceScope.security_groups.length === 0 &&
          translate('Instance does not have any security groups yet.')}
        {props.resourceScope.security_groups.length > 0 && (
          <OpenStackSecurityGroupsTable
            securityGroups={props.resourceScope.security_groups}
          />
        )}
      </Card.Body>
    </Card>
  );
};

import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { GroupInvitationsList } from '@waldur/invitations/GroupInvitationsList';
import { InvitationsList } from '@waldur/invitations/InvitationsList';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer } from '@waldur/workspace/selectors';

import { CustomerPermissionsLogList } from './CustomerPermissionsLogList';
import { CustomerPermissionsReviewList } from './CustomerPermissionsReviewList';
import { CustomerUsersList } from './CustomerUsersList';
import { OfferingPermissionsList } from './OfferingPermissionsList';

export const CustomerTeam: FunctionComponent = () => {
  useTitle(translate('Team'));
  const customer = useSelector(getCustomer);
  return (
    <div className="tabs-container m-l-sm">
      <Tabs
        unmountOnExit
        mountOnEnter
        defaultActiveKey="users"
        id="customer-team"
      >
        <Tab title={translate('Users')} eventKey="users">
          <Card.Body>
            <CustomerUsersListFilter />
            <CustomerUsersList />
          </Card.Body>
        </Tab>
        <Tab title={translate('Invitations')} eventKey="invitations">
          <Card.Body>
            <InvitationsList />
          </Card.Body>
        </Tab>
        {isFeatureVisible('invitations.show_group_invitations') && (
          <Tab
            title={translate('Group invitations')}
            eventKey="group-invitations"
          >
            <Card.Body>
              <GroupInvitationsList />
            </Card.Body>
          </Tab>
        )}
        <Tab title={translate('Permissions log')} eventKey="permissions">
          <Card.Body>
            <CustomerPermissionsLogList />
          </Card.Body>
        </Tab>
        <Tab title={translate('Reviews')} eventKey="reviews">
          <Card.Body>
            <CustomerPermissionsReviewList />
          </Card.Body>
        </Tab>
        {customer.is_service_provider && (
          <Tab title={translate('Offering permissions')} eventKey="offerings">
            <Card.Body>
              <OfferingPermissionsList />
            </Card.Body>
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

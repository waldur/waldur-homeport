import { FunctionComponent } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { translate } from '@waldur/i18n';
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
        animation={false}
      >
        <Tab title={translate('Users')} eventKey="users">
          <PanelBody>
            <CustomerUsersListFilter />
            <CustomerUsersList />
          </PanelBody>
        </Tab>
        <Tab title={translate('Invitations')} eventKey="invitations">
          <PanelBody>
            <InvitationsList />
          </PanelBody>
        </Tab>
        <Tab title={translate('Permissions log')} eventKey="permissions">
          <PanelBody>
            <CustomerPermissionsLogList />
          </PanelBody>
        </Tab>
        <Tab title={translate('Reviews')} eventKey="reviews">
          <PanelBody>
            <CustomerPermissionsReviewList />
          </PanelBody>
        </Tab>
        {customer.is_service_provider && (
          <Tab title={translate('Offering permissions')} eventKey="offerings">
            <PanelBody>
              <OfferingPermissionsList />
            </PanelBody>
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

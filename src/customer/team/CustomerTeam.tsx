import React from 'react';
import PanelBody from 'react-bootstrap/lib/PanelBody';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';

import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { translate } from '@waldur/i18n';
import { InvitationsList } from '@waldur/invitations/InvitationsList';
import { useTitle } from '@waldur/navigation/title';

import { CustomerPermissionsLogList } from './CustomerPermissionsLogList';
import { CustomerPermissionsReviewList } from './CustomerPermissionsReviewList';
import { CustomerUsersList } from './CustomerUsersList';

export const CustomerTeam = () => {
  useTitle(translate('Team'));
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
      </Tabs>
    </div>
  );
};

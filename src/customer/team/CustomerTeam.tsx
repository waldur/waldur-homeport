import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { InvitationsList } from '@waldur/invitations/InvitationsList';

import { CustomerPermissionsLogList } from './CustomerPermissionsLogList';
import { CustomerUsersList } from './CustomerUsersList';

export const CustomerTeam = () => (
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
    </Tabs>
  </div>
);

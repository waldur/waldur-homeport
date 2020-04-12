import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { angular2react } from '@waldur/shims/angular2react';
import { connectAngularComponent } from '@waldur/store/connect';
import { CustomerPermissionsLogList } from '@waldur/team/CustomerPermissionsLogList';

const CustomerUsersList = angular2react('customerUsersList');
const InvitationsList = angular2react('invitationsList');

export const CustomerTeam = () => (
  <div className="tabs-container m-l-sm">
    <Tabs unmountOnExit mountOnEnter defaultActiveKey="users">
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

export default connectAngularComponent(CustomerTeam);

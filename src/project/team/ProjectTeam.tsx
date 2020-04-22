import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';

import { ProjectPermissionsLogList } from './ProjectPermissionsLogList';
import { ProjectUsersList } from './ProjectUsersList';

export const ProjectTeam = () => (
  <div className="tabs-container m-l-sm">
    <Tabs
      unmountOnExit
      mountOnEnter
      defaultActiveKey="users"
      animation={false}
      id="project-team"
    >
      <Tab title={translate('Users')} eventKey="users">
        <PanelBody>
          <ProjectUsersList />
        </PanelBody>
      </Tab>
      <Tab title={translate('Permissions log')} eventKey="permissions">
        <PanelBody>
          <ProjectPermissionsLogList />
        </PanelBody>
      </Tab>
    </Tabs>
  </div>
);

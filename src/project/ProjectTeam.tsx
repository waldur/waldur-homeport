import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { angular2react } from '@waldur/shims/angular2react';
import { connectAngularComponent } from '@waldur/store/connect';
import { ProjectPermissionsLogList } from '@waldur/team/ProjectPermissionsLogList';

const ProjectUsersList = angular2react('projectUsers');

export const ProjectTeam = () => (
  <div className="tabs-container m-l-sm">
    <Tabs unmountOnExit mountOnEnter defaultActiveKey="users" id="project-team">
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

export default connectAngularComponent(ProjectTeam);

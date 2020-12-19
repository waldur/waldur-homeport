import { FunctionComponent } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { ProjectPermissionsLogList } from './ProjectPermissionsLogList';
import { ProjectUsersList } from './ProjectUsersList';

export const ProjectTeam: FunctionComponent = () => {
  useTitle(translate('Team'));
  return (
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
};

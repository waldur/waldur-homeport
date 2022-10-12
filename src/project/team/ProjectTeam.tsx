import { FunctionComponent } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { InvitationPolicyService } from '@waldur/invitations/actions/InvitationPolicyService';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { InvitationsList } from './InvitationsList';
import { ProjectPermissionsLogList } from './ProjectPermissionsLogList';
import { ProjectUsersList } from './ProjectUsersList';

export const ProjectTeam: FunctionComponent = () => {
  useTitle(translate('Team'));
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const canShowInvitations = InvitationPolicyService.canAccessInvitations({
    user,
    customer,
    project,
  });
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
        {canShowInvitations && (
          <Tab title={translate('Invitations')} eventKey="invitations">
            <PanelBody>
              <InvitationsList />
            </PanelBody>
          </Tab>
        )}
        <Tab title={translate('Permissions log')} eventKey="permissions">
          <PanelBody>
            <ProjectPermissionsLogList />
          </PanelBody>
        </Tab>
      </Tabs>
    </div>
  );
};

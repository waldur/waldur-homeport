import { FunctionComponent } from 'react';
import { PanelBody, Tab, Tabs } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ProjectUpdateContainer } from './ProjectUpdateContainer';

export const ProjectDetailsDialog: FunctionComponent<{
  resolve: { project };
}> = ({ resolve: { project } }) => (
  <ModalDialog
    title={translate('Project details')}
    footer={<CloseDialogButton />}
  >
    <Tabs
      id="project-details"
      unmountOnExit
      mountOnEnter
      defaultActiveKey="general"
    >
      <Tab title={translate('General')} eventKey="general">
        <PanelBody>
          <ProjectUpdateContainer project={project} />
        </PanelBody>
      </Tab>
    </Tabs>
  </ModalDialog>
);

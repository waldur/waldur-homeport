import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ProjectUpdateContainer } from './ProjectUpdateContainer';

export const ProjectDetailsDialog = ({ resolve: { project } }) => (
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

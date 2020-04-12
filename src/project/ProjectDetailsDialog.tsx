import * as React from 'react';
import * as PanelBody from 'react-bootstrap/lib/PanelBody';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { angular2react } from '@waldur/shims/angular2react';
import { connectAngularComponent } from '@waldur/store/connect';
import { Project } from '@waldur/workspace/types';

import { ProjectUpdateContainer } from './ProjectUpdateContainer';

const ProjectPolicies = angular2react<{ project: Project }>('projectPolicies', [
  'project',
]);

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
      <Tab title={translate('Policies')} eventKey="policies">
        <PanelBody>
          <ProjectPolicies project={project} />
        </PanelBody>
      </Tab>
    </Tabs>
  </ModalDialog>
);

export default connectAngularComponent(ProjectDetailsDialog, ['resolve']);

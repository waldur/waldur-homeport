import { FunctionComponent } from 'react';

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
    <ProjectUpdateContainer project={project} />
  </ModalDialog>
);

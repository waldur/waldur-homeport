import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { loadOecdCodes } from './api';
import { ProjectUpdateContainer } from './ProjectUpdateContainer';

export const ProjectDetailsDialog: FunctionComponent<{
  resolve: { project };
}> = ({ resolve: { project } }) => {
  const { loading, value: oecdCodes } = useAsync(loadOecdCodes);
  return (
    <ModalDialog title={translate('Project details')}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ProjectUpdateContainer
          project={project}
          oecdCodes={oecdCodes}
          isModal={true}
        />
      )}
    </ModalDialog>
  );
};

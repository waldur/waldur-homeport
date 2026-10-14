import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { LayoutWarningBar } from '@/navigation/LayoutWarningBar';
import { useProject } from '@/workspace/hooks';

import { ProjectRecoveryModal } from './ProjectRecoveryModal';

export const RemovedProjectWarningBar: FC = () => {
  const { openDialog } = useModal();
  const project = useProject();
  const { state } = useCurrentStateAndParams();

  // Only show the warning bar on project-related pages
  const isProjectPage =
    state?.name?.startsWith('project.') || state?.name?.startsWith('project-');

  if (!project || !project.is_removed || !isProjectPage) {
    return null;
  }

  const openRecoveryModal = () => {
    openDialog(ProjectRecoveryModal, {
      resolve: { project },
      size: 'lg',
    });
  };

  return (
    <LayoutWarningBar
      title={`${translate('Project Removed')}:`}
      actions={
        <BaseButton
          onClick={openRecoveryModal}
          label={translate('Recover Project')}
          iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
          variant="warning"
          size="sm"
        />
      }
    >
      {translate(
        'This project has been removed. All resources have been terminated and user roles have been revoked.',
      )}
    </LayoutWarningBar>
  );
};

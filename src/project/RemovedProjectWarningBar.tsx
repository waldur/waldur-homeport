import {
  WarningCircleIcon,
  ArrowCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { FeaturedIcon } from '@/core/FeaturedIcon';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CompactActionButton } from '@/table/CompactActionButton';
import { getProject } from '@/workspace/selectors';

import { ProjectRecoveryModal } from './ProjectRecoveryModal';

export const RemovedProjectWarningBar: FC = () => {
  const { openDialog } = useModal();
  const project = useSelector(getProject);
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
    <div className="layout-warning-bar bar-warning">
      <div className="container-fluid w-100 d-flex align-items-center gap-2">
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          size="sm"
        />
        <p className="text-start fs-6 mb-0">
          <strong className="fw-bold">{translate('Project Removed')}: </strong>
          {translate(
            'This project has been removed. All resources have been terminated and user roles have been revoked.',
          )}
        </p>
        <CompactActionButton
          action={openRecoveryModal}
          title={translate('Recover Project')}
          iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
          variant="warning"
          className="ms-auto"
        />
      </div>
    </div>
  );
};

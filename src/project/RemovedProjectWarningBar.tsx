import {
  WarningCircleIcon,
  ArrowCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { CompactActionButton } from '@waldur/table/CompactActionButton';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectRecoveryModal } from './ProjectRecoveryModal';

export const RemovedProjectWarningBar: FC = () => {
  const dispatch = useDispatch();
  const project = useSelector(getProject);
  const { state } = useCurrentStateAndParams();

  // Only show the warning bar on project-related pages
  const isProjectPage =
    state?.name?.startsWith('project.') || state?.name?.startsWith('project-');

  if (!project || !project.is_removed || !isProjectPage) {
    return null;
  }

  const openRecoveryModal = () => {
    dispatch(
      openModalDialog(ProjectRecoveryModal, {
        resolve: { project },
        size: 'lg',
      }),
    );
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
        {isExperimentalUiComponentsVisible() && (
          <CompactActionButton
            action={openRecoveryModal}
            title={translate('Recover Project')}
            iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
            variant="warning"
            className="ms-auto"
          />
        )}
      </div>
    </div>
  );
};

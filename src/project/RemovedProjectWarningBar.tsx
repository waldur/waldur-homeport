import { TrashIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { RadarIcon } from '@waldur/core/RadarIcon';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { openModalDialog } from '@waldur/modal/actions';
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
    <div className="removed-project-warning-bar bg-danger bg-opacity-10 border-danger border-opacity-25 border-bottom">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center">
            {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
            <RadarIcon IconComponent={TrashIcon} variant="danger" size="sm" />
            <span className="ms-2 text-danger">
              <strong>{translate('Project Removed')}:</strong>{' '}
              {translate(
                'This project has been removed. All resources have been terminated and user roles have been revoked.',
              )}
            </span>
          </div>
          {isExperimentalUiComponentsVisible() && (
            <div>
              <Button
                variant="danger"
                size="sm"
                onClick={openRecoveryModal}
                className="d-flex align-items-center gap-2"
              >
                <ArrowCounterClockwiseIcon size={16} weight="bold" />
                {translate('Recover Project')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

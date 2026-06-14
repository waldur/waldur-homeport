import { ChatsCircle, HeadsetIcon, WarningIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { Link } from '@/core/Link';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { useProjectMatrixRooms } from '@/matrix/chat/useProjectMatrixRooms';
import { isMatrixChatEnabled } from '@/matrix/utils';

interface ProjectActionsProps {
  project: Project;
}

export const ProjectActions = ({ project }: ProjectActionsProps) => {
  const { openDrawer } = useDrawer();
  const showIssues = hasSupport();
  const showMatrixChat = isMatrixChatEnabled();
  const isCourseProject = project.kind === 'course';

  const { data: rooms } = useProjectMatrixRooms(project.uuid);
  const activeRoom = rooms?.find((r) => r.state === 'active');

  const openChat = useCallback(() => {
    if (!activeRoom) return;
    openUnifiedChatDrawer(openDrawer, {
      defaultRoomUuid: activeRoom.uuid,
      matrixRoomAlias: activeRoom.room_alias,
    });
  }, [openDrawer, activeRoom]);

  const supportButtonClass = isCourseProject
    ? 'btn btn-secondary btn-icon btn-sm'
    : 'btn btn-secondary btn-lg';

  const supportButton = (
    <Link
      state="project.issues"
      params={{ uuid: project.uuid }}
      className={supportButtonClass}
      aria-label={translate('Support')}
    >
      <span className="svg-icon svg-icon-2">
        {isCourseProject ? (
          <HeadsetIcon weight="bold" />
        ) : (
          <WarningIcon weight="bold" />
        )}
      </span>
      {!isCourseProject && translate('Support')}
    </Link>
  );

  return (
    <div className="d-flex gap-2">
      {showMatrixChat && activeRoom && (
        <button type="button" className="btn btn-secondary" onClick={openChat}>
          <span className="svg-icon svg-icon-2">
            <ChatsCircle weight="bold" />
          </span>
          {translate('Team chat')}
        </button>
      )}
      {showIssues &&
        (isCourseProject ? (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="project-support-tooltip">
                {translate('Support')}
              </Tooltip>
            }
          >
            <span>{supportButton}</span>
          </OverlayTrigger>
        ) : (
          supportButton
        ))}
    </div>
  );
};

import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { useProjectMatrixRooms } from '@/matrix/chat/useProjectMatrixRooms';
import { NoResult } from '@/navigation/header/search/NoResult';
import { getProject } from '@/workspace/selectors';

import { MatrixChatPanel } from './chat/MatrixChatPanel';

/**
 * Full-page team chat. The `project.communication` route only resolves when
 * the project has an active room, so this renders the chat panel for it.
 * Creating and reactivating rooms live in the project settings "Chat" tab;
 * the fallback here only covers the active room vanishing mid-session.
 */
export const ProjectCommunication: FC = () => {
  const project = useSelector(getProject);
  const { data: rooms } = useProjectMatrixRooms(project?.uuid);

  const activeRoom = rooms?.find((r) => r.state === 'active');

  if (activeRoom) {
    return (
      <div
        className="card overflow-hidden mt-6"
        style={{ height: 'calc(100vh - 320px)', minHeight: 480 }}
      >
        <MatrixChatPanel
          forceDock
          hideRoomList
          defaultRoomUuid={activeRoom.uuid}
        />
      </div>
    );
  }

  return (
    <NoResult
      title={translate('Chat room unavailable')}
      message={translate(
        'The chat room for this project is currently unavailable.',
      )}
      noAction
    />
  );
};

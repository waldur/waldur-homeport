import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  CloudArrowUpIcon,
  PhoneIcon,
} from '@phosphor-icons/react';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Dropzone from 'react-dropzone';

import { LoadingErred } from '@/core/LoadingErred';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { CallInProgressBanner } from './call/CallInProgressBanner';
import { MatrixCallDockSlot } from './call/MatrixCallDockSlot';
import { MatrixCallPortalContext } from './call/MatrixCallPortalContext';
import { useMatrixCall } from './call/useMatrixCall';
import { MatrixChatHeader } from './MatrixChatHeader';
import { MatrixMessageInput } from './MatrixMessageInput';
import { MatrixMessageList } from './MatrixMessageList';
import { MatrixRoomSelector } from './MatrixRoomSelector';
import { MatrixSyncStatus } from './MatrixSyncStatus';
import { MatrixTypingIndicator } from './MatrixTypingIndicator';
import { useAllMatrixRooms } from './useAllMatrixRooms';
import { useMatrixClient } from './useMatrixClient';
import { useMatrixFileUpload } from './useMatrixFileUpload';
import { useMatrixRoom } from './useMatrixRoom';
import { useMatrixRooms } from './useMatrixRooms';
import { useRoomMemberNames } from './useRoomMemberNames';

interface MatrixChatDrawerProps {
  roomUuid: string;
  projectUuid?: string;
  roomAlias?: string | null;
  /** Room name resolved by the caller — avoids a redundant rooms lookup. */
  roomName?: string;
  onBack?: () => void;
}

export const MatrixChatDrawer: FC<MatrixChatDrawerProps> = ({
  roomUuid,
  projectUuid,
  roomAlias,
  roomName,
  onBack,
}) => {
  const { connect, connectionState, userId, error, activeRoomId } =
    useMatrixClient();
  const { callState, callRoomId, callRoomUuid } = useMatrixCall();
  const { requestReturnToCall } = useContext(MatrixCallPortalContext);
  const [activeRoomUuid, setActiveRoomUuid] = useState(roomUuid);
  const { data: rooms } = useMatrixRooms(projectUuid);
  const { rooms: allRooms } = useAllMatrixRooms();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  const currentUser = useUser();
  const {
    uploadFile,
    uploading,
    pendingFiles,
    addFiles,
    removePending,
    setPending,
    clearPending,
  } = useMatrixFileUpload();

  // The room member list may omit the current user; their Waldur full name is
  // authoritative, so add it so own messages never fall back to the (emoji-
  // laden) Matrix display name.
  const resolvedMemberNames = useMemo(() => {
    if (!userId || !currentUser?.full_name || memberNames.has(userId)) {
      return memberNames;
    }
    return new Map(memberNames).set(userId, currentUser.full_name);
  }, [memberNames, userId, currentUser?.full_name]);

  const {
    messages,
    typingUsers,
    markRoomRead,
    loading,
    loadingOlder,
    hasOlderMessages,
    loadOlderMessages,
  } = useMatrixRoom();

  // Connect on mount
  useEffect(() => {
    connect(activeRoomUuid);
  }, [activeRoomUuid]);

  const handleRoomSelect = useCallback(
    (uuid: string) => {
      setActiveRoomUuid(uuid);
      connect(uuid);
    },
    [connect],
  );

  const activeRooms =
    rooms?.filter((r) => r.state === 'active' && r.room_alias) || [];

  // 'discovering' is included so the drawer reserves the call pane the moment
  // a room is claimed — otherwise MatrixCallHost falls back to the floating
  // widget for the entire token-acquisition window and flashes when it docks.
  const callLive =
    callState === 'discovering' ||
    callState === 'connecting' ||
    callState === 'connected';
  // A failed call stays anchored to its room so the error panel docks here
  // rather than detaching into the floating widget. The cross-room banner stays
  // tied to live calls only — a failed call elsewhere is nothing to return to.
  const callAnchored = callLive || callState === 'error';
  const showCallView = callAnchored && callRoomId === activeRoomId;
  const showCrossRoomBanner =
    callLive && callRoomId !== null && callRoomId !== activeRoomId;
  const callRoom = callRoomUuid
    ? allRooms.find((r) => r.uuid === callRoomUuid)
    : null;

  // Hidden during a live call lets the user focus on the video. Reset to
  // visible whenever there's no live call (ended or errored) so chat is never
  // stranded behind the toggle, which is itself hidden outside a live call.
  const [chatVisible, setChatVisible] = useState(true);
  useEffect(() => {
    if (!callLive) setChatVisible(true);
  }, [callLive]);

  const showChat = !showCallView || chatVisible;

  const showConnectionError =
    connectionState === 'error' && messages.length === 0 && !showCallView;

  return (
    <Dropzone
      noClick
      noKeyboard
      disabled={connectionState !== 'connected'}
      onDrop={(files) => addFiles(files)}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps({
            className: 'team-chat h-100 d-flex flex-column position-relative',
          })}
        >
          <input {...getInputProps()} />
          {isDragActive && (
            <div className="tc-dropzone-overlay">
              <div className="tc-dropzone-card">
                <CloudArrowUpIcon size={36} weight="bold" />
                <span>{translate('Drop files to attach')}</span>
              </div>
            </div>
          )}
          <MatrixChatHeader
            roomUuid={activeRoomUuid}
            roomName={
              roomName ||
              activeRooms.find((r) => r.uuid === activeRoomUuid)?.room_name ||
              translate('Chat')
            }
            roomAlias={roomAlias}
            projectUuid={projectUuid}
            onBack={onBack}
          />

          {messages.length > 0 && (
            <MatrixSyncStatus state={connectionState} error={error} />
          )}

          <CallInProgressBanner />

          {showCrossRoomBanner && (
            <div className="d-flex align-items-center gap-2 px-4 py-2 bg-light-success border-bottom">
              <PhoneIcon size={16} className="text-success" weight="fill" />
              <span className="text-sm flex-grow-1">
                {translate('Call in progress in {room}', {
                  room:
                    (callRoom as any)?.room_name ?? translate('another room'),
                })}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={requestReturnToCall}
              >
                {translate('Return to call')}
              </button>
            </div>
          )}

          {activeRooms.length > 1 && !onBack && (
            <MatrixRoomSelector
              rooms={activeRooms}
              activeRoomUuid={activeRoomUuid}
              onSelect={handleRoomSelect}
            />
          )}

          <div className="flex-grow-1 overflow-hidden d-flex flex-column">
            {showConnectionError && (
              <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
                <LoadingErred
                  loadData={() => connect(activeRoomUuid)}
                  message={
                    error || translate('Could not connect to the chat server.')
                  }
                />
              </div>
            )}
            {showCallView && (
              <div
                className="position-relative overflow-hidden"
                style={{
                  display: 'flex',
                  flex: showChat ? '0 0 60%' : '1 1 auto',
                }}
              >
                <MatrixCallDockSlot roomId={activeRoomId} />
                {callLive && (
                  <div
                    className="position-absolute"
                    style={{ top: 8, right: 8, zIndex: 2 }}
                  >
                    <Tip
                      id="matrix-call-chat-toggle"
                      label={
                        chatVisible
                          ? translate('Hide chat')
                          : translate('Show chat')
                      }
                      placement="left"
                    >
                      <button
                        type="button"
                        className="btn btn-icon btn-sm btn-light"
                        onClick={() => setChatVisible((v) => !v)}
                        aria-label={
                          chatVisible
                            ? translate('Hide chat')
                            : translate('Show chat')
                        }
                      >
                        {chatVisible ? (
                          <ArrowsOutSimpleIcon weight="bold" />
                        ) : (
                          <ArrowsInSimpleIcon weight="bold" />
                        )}
                      </button>
                    </Tip>
                  </div>
                )}
              </div>
            )}
            {showChat && !showConnectionError && (
              <div className="flex-grow-1 overflow-hidden d-flex flex-column">
                <MatrixMessageList
                  messages={messages}
                  userId={userId}
                  memberNames={resolvedMemberNames}
                  loading={loading || connectionState === 'connecting'}
                  loadingOlder={loadingOlder}
                  hasOlderMessages={hasOlderMessages}
                  onLoadOlder={loadOlderMessages}
                  onReadLatest={markRoomRead}
                />
              </div>
            )}
          </div>

          {showChat && !showConnectionError && (
            <MatrixTypingIndicator typingUsers={typingUsers} />
          )}
          {showChat && !showConnectionError && (
            <MatrixMessageInput
              uploadFile={uploadFile}
              uploading={uploading}
              pendingFiles={pendingFiles}
              addFiles={addFiles}
              removePending={removePending}
              setPending={setPending}
              clearPending={clearPending}
            />
          )}
        </div>
      )}
    </Dropzone>
  );
};

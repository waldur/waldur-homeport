import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  ChatsCircleIcon,
  CloudArrowUpIcon,
  PhoneIcon,
} from '@phosphor-icons/react';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import Dropzone from 'react-dropzone';

import { BaseButton, Tooltip } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { useUser } from '@/workspace/hooks';

import { CallInProgressBanner } from './call/CallInProgressBanner';
import { MatrixCallDockSlot } from './call/MatrixCallDockSlot';
import { MatrixCallPortalContext } from './call/MatrixCallPortalContext';
import { useMatrixCall } from './call/useMatrixCall';
import { MatrixChatHeader } from './MatrixChatHeader';
import {
  MatrixMessageActionsProvider,
  useMatrixMessageActionsValue,
} from './MatrixMessageActionsContext';
import { MatrixMessageInput } from './MatrixMessageInput';
import { MatrixMessageList } from './MatrixMessageList';
import { MatrixSyncStatus } from './MatrixSyncStatus';
import { MatrixTypingIndicator } from './MatrixTypingIndicator';
import { buildReplyFields } from './messageContent';
import { isRoomOpenElsewhere } from './roomViews';
import { useAllMatrixRooms } from './useAllMatrixRooms';
import { useMatrixClient } from './useMatrixClient';
import { useMatrixFileUpload } from './useMatrixFileUpload';
import { useMatrixRoom } from './useMatrixRoom';
import { useRoomMemberImages, useRoomMemberNames } from './useRoomMemberNames';
import { buildVoiceContent } from './voice/buildVoiceContent';
import { generateWaveform } from './voice/generateWaveform';
import { useVoiceRecorder } from './voice/useVoiceRecorder';

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
  const {
    connect,
    connectionState,
    userId,
    error,
    activeRoomId,
    activeRoomUuid,
    requestedRoomUuid,
    failedRoomUuid,
    registerRoomView,
    showRoomHere,
  } = useMatrixClient();
  // The timeline, typing, calls and uploads follow the active room, so until
  // this room is the active one they belong to another room than the header.
  const roomNotOpen = activeRoomUuid !== roomUuid;
  // Nothing is coming for this room: a spinner would wait forever.
  const roomOpenElsewhere = isRoomOpenElsewhere(
    { connectionState, activeRoomUuid, requestedRoomUuid },
    roomUuid,
  );
  const { callState, callRoomId, callRoomUuid } = useMatrixCall();
  const { requestReturnToCall } = useContext(MatrixCallPortalContext);
  const { rooms: allRooms } = useAllMatrixRooms();
  const memberNames = useRoomMemberNames(roomUuid);
  const memberImages = useRoomMemberImages(roomUuid);
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
  const recorder = useVoiceRecorder();
  const [sendingVoice, setSendingVoice] = useState(false);

  const startRecording = useCallback(() => {
    // getUserMedia rejects if the user denies the mic prompt; fall back to the
    // normal composer rather than leaving a stuck recording UI.
    recorder.start().catch(() => {});
  }, [recorder]);

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
  const messageActions = useMatrixMessageActionsValue(messages);

  const sendVoiceMessage = useCallback(async () => {
    if (roomNotOpen) return;
    // A reply being written goes with the voice message.
    const { replyTo, cancelReply } = messageActions;
    setSendingVoice(true);
    try {
      const result = await recorder.stop();
      if (!result) return;
      const { blob, durationMs } = result;
      const { waveform } = await generateWaveform(blob);
      const sent = await uploadFile(
        new File([blob], 'voice-message', { type: blob.type }),
        (media) =>
          buildVoiceContent({
            media,
            mimetype: blob.type,
            size: blob.size,
            durationMs,
            waveform,
          }),
        replyTo
          ? buildReplyFields(replyTo.eventId, replyTo.sender, userId)
          : undefined,
      );
      if (sent && replyTo) cancelReply();
    } finally {
      setSendingVoice(false);
    }
  }, [roomNotOpen, recorder, uploadFile, messageActions, userId]);

  // Before paint: beside another view's room, a view that asked any later
  // would first show the notice for the room it is about to open.
  useLayoutEffect(() => {
    connect(roomUuid);
  }, [roomUuid]);

  useEffect(() => registerRoomView(roomUuid), [registerRoomView, roomUuid]);

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
  const showCallView =
    callAnchored && callRoomId === activeRoomId && !roomNotOpen;
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

  // An ended session has no client left, so its panel replaces the
  // conversation whatever the drawer showed before.
  const sessionEnded = connectionState === 'ended';
  const showConnectionError =
    sessionEnded ||
    (connectionState === 'error' && messages.length === 0 && !showCallView) ||
    (connectionState === 'connected' &&
      failedRoomUuid === roomUuid &&
      roomNotOpen);

  return (
    <MatrixMessageActionsProvider value={messageActions}>
      <Dropzone
        noClick
        noKeyboard
        disabled={connectionState !== 'connected' || roomNotOpen}
        onDrop={(files) => addFiles(files)}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps({
              className: 'team-chat h-full flex flex-col relative',
            })}
            // The waldur-integration-testing suite selects the open
            // conversation by this (docs/e2e-locators.md).
            data-testid="team-chat-conversation"
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
              roomUuid={roomUuid}
              roomName={
                roomName ||
                allRooms.find((r) => r.uuid === roomUuid)?.room_name ||
                translate('Chat')
              }
              roomAlias={roomAlias}
              projectUuid={projectUuid}
              onBack={onBack}
            />

            {messages.length > 0 && (
              <MatrixSyncStatus state={connectionState} error={error} />
            )}

            {!roomNotOpen && <CallInProgressBanner />}

            {showCrossRoomBanner && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-subtle border-b border-b-secondary">
                <PhoneIcon size={16} className="text-success" weight="fill" />
                <span className="text-sm grow">
                  {translate('Call in progress in {room}', {
                    room:
                      (callRoom as any)?.room_name ?? translate('another room'),
                  })}
                </span>
                <BaseButton
                  variant="success"
                  size="sm"
                  onClick={requestReturnToCall}
                  label={translate('Return to call')}
                />
              </div>
            )}

            <div className="grow overflow-hidden flex flex-col">
              {showConnectionError && (
                <div className="grow flex items-center justify-center p-3">
                  <LoadingErred
                    loadData={() => connect(roomUuid)}
                    message={
                      sessionEnded
                        ? translate('Your chat session has ended.')
                        : error ||
                          translate('Could not connect to the chat server.')
                    }
                  />
                </div>
              )}
              {showCallView && (
                <div
                  className="relative overflow-hidden flex"
                  style={{ flex: showChat ? '0 0 60%' : '1 1 auto' }}
                >
                  <MatrixCallDockSlot roomId={activeRoomId} />
                  {callLive && (
                    <div className="absolute top-2 end-2" style={{ zIndex: 2 }}>
                      <Tooltip
                        label={
                          chatVisible
                            ? translate('Hide chat')
                            : translate('Show chat')
                        }
                        side="left"
                      >
                        <BaseButton
                          onClick={() => setChatVisible((v) => !v)}
                          aria-label={
                            chatVisible
                              ? translate('Hide chat')
                              : translate('Show chat')
                          }
                          variant="tertiary"
                          size="sm"
                          iconNode={
                            chatVisible ? (
                              <ArrowsOutSimpleIcon weight="bold" />
                            ) : (
                              <ArrowsInSimpleIcon weight="bold" />
                            )
                          }
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}
              {showChat && !showConnectionError && (
                <div className="grow overflow-hidden flex flex-col">
                  {roomOpenElsewhere ? (
                    <NoResult
                      icon={<ChatsCircleIcon weight="bold" size={24} />}
                      title={translate('Another conversation is open')}
                      message={translate(
                        'Only one conversation can be open at a time.',
                      )}
                      buttonTitle={translate('Open here')}
                      callback={() => showRoomHere(roomUuid)}
                    />
                  ) : (
                    <MatrixMessageList
                      messages={messages}
                      userId={userId}
                      memberNames={resolvedMemberNames}
                      memberImages={memberImages}
                      loading={
                        loading ||
                        connectionState === 'connecting' ||
                        roomNotOpen
                      }
                      loadingOlder={loadingOlder}
                      hasOlderMessages={hasOlderMessages}
                      onLoadOlder={loadOlderMessages}
                      onReadLatest={markRoomRead}
                    />
                  )}
                </div>
              )}
            </div>

            {showChat && !showConnectionError && !roomNotOpen && (
              <MatrixTypingIndicator
                typingUsers={typingUsers}
                memberImages={memberImages}
              />
            )}
            {showChat && !showConnectionError && (
              <div className="tc-composer-dock">
                <MatrixMessageInput
                  roomUuid={roomUuid}
                  uploadFile={uploadFile}
                  uploading={uploading}
                  pendingFiles={pendingFiles}
                  addFiles={addFiles}
                  removePending={removePending}
                  setPending={setPending}
                  clearPending={clearPending}
                  onStartRecording={startRecording}
                  recordingSupported={recorder.supported}
                  recording={recorder.state === 'recording' || sendingVoice}
                  recordingElapsedMs={recorder.elapsedMs}
                  sendingVoice={sendingVoice}
                  onCancelRecording={recorder.cancel}
                  onSendVoice={sendVoiceMessage}
                />
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </MatrixMessageActionsProvider>
  );
};

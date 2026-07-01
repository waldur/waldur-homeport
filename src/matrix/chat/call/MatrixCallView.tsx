import { isEqualTrackRef, isTrackReference } from '@livekit/components-core';
import {
  CarouselLayout,
  DisconnectButton,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useLayoutContext,
  useLocalParticipant,
  usePinnedTracks,
  useSpeakingParticipants,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  CornersInIcon,
  CornersOutIcon,
  PhoneSlashIcon,
  PictureInPictureIcon,
} from '@phosphor-icons/react';
import { DisconnectReason, setLogLevel, Track } from 'livekit-client';
import {
  FC,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { useMatrixClient } from '../useMatrixClient';
import { formatDisplayName } from '../utils';

import { CallSettingsMenu } from './CallSettingsMenu';
import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { CallMemberInfo } from './types';
import { useFullscreen } from './useFullscreen';
import { useMatrixCall } from './useMatrixCall';

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

// LiveKit log level is set inside MatrixCallView's mount effect so the
// module-level side effect can't clobber another consumer of livekit-client
// loaded later in the bundle.

// Mirrors element-hq/lk-jwt-service processSFURequest in main.go:
//   lkIdentity = unpaddedBase64(sha256(JSON.stringify([userId, claimedDeviceId, memberId])))
// We send member.id === claimed_device_id === deviceId in useLiveKitToken.ts,
// so all three slots collapse to (userId, deviceId, deviceId).
async function computeLiveKitIdentity(
  userId: string,
  deviceId: string,
): Promise<string | null> {
  if (!userId || !deviceId) return null;
  const raw = JSON.stringify([userId, deviceId, deviceId]);
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw),
  );
  const padded = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return padded.replace(/=+$/, '');
}

interface IdentityEntry {
  userId: string;
  deviceId: string;
  displayName: string;
}

function useIdentityNameMap(entries: IdentityEntry[]): Map<string, string> {
  const [map, setMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const next = new Map<string, string>();
      for (const e of entries) {
        const identity = await computeLiveKitIdentity(e.userId, e.deviceId);
        if (identity) next.set(identity, e.displayName);
      }
      if (!cancelled) {
        setMap(next);
      }
    }

    build();
    return () => {
      cancelled = true;
    };
  }, [entries]);

  return map;
}

// NameOverrider mutates LiveKit's internal participant tile DOM. The
// queried selectors (.lk-participant-tile, .lk-participant-name, the
// data-lk-local-participant attribute) are LiveKit-version-specific —
// pinned against @livekit/components-react 2.x. A future LiveKit
// upgrade that renames any of these will silently break name overrides
// (falling back to identity hashes); the test suite catches this.
const NameOverrider: FC<{
  containerRef: React.RefObject<HTMLDivElement>;
  identityMap: Map<string, string>;
  localDisplayName: string;
}> = ({ containerRef, identityMap, localDisplayName }) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const apply = () => {
      const tiles = container.querySelectorAll('.lk-participant-tile');
      tiles.forEach((tile) => {
        const nameEl = tile.querySelector('.lk-participant-name');
        if (!nameEl) return;
        // Screenshare tiles render `<span>{identity}'s screen</span>` as two
        // adjacent text nodes — only swap the first one to preserve the suffix.
        const firstNode = nameEl.firstChild;
        if (!firstNode || firstNode.nodeType !== Node.TEXT_NODE) return;
        const isLocal =
          tile.getAttribute('data-lk-local-participant') === 'true';
        if (isLocal) {
          if (localDisplayName && firstNode.nodeValue !== localDisplayName) {
            firstNode.nodeValue = localDisplayName;
          }
          return;
        }
        const current = firstNode.nodeValue || '';
        const mapped = identityMap.get(current);
        if (mapped && current !== mapped) {
          firstNode.nodeValue = mapped;
        }
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [containerRef, identityMap, localDisplayName]);

  return null;
};

// Sticky-debounced active speaker. A candidate must remain the top speaker
// continuously for `delayMs` before we commit to it; while no one is speaking
// we keep the last committed speaker on screen so the compact tile doesn't
// flap on short utterances.
function useStableSpeaker(
  candidateId: string | null,
  delayMs: number,
): string | null {
  const [stableId, setStableId] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId || candidateId === stableId) return;
    const timer = setTimeout(() => setStableId(candidateId), delayMs);
    return () => clearTimeout(timer);
  }, [candidateId, stableId, delayMs]);

  return stableId;
}

const COMPACT_SPEAKER_DEBOUNCE_MS = 2000;

const CallStage: FC<{
  compact?: boolean;
  containerRef: RefObject<HTMLElement>;
  fullscreenTarget?: HTMLElement | null;
}> = ({ compact = false, containerRef, fullscreenTarget }) => {
  // Fullscreen the host's relocation container (the unit that travels between
  // dock / floating widget / PiP), not the inner view — otherwise the host
  // moves the element out from under fullscreen. Falls back to the view itself
  // if no host container was provided.
  const fsRef = useRef<HTMLElement | null>(null);
  fsRef.current = fullscreenTarget ?? containerRef.current;
  const {
    isFullscreen,
    supported: fullscreenSupported,
    toggle: toggleFullscreen,
  } = useFullscreen(fsRef);
  // Leave overlay positioning to react-bootstrap's default everywhere except
  // fullscreen: there, body-portaled overlays are invisible (the Fullscreen API
  // only paints the fullscreened subtree), so target the call element instead.
  const overlayContainer = isFullscreen ? containerRef.current : undefined;
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const layoutContext = useLayoutContext();
  const pinnedTracks = usePinnedTracks(layoutContext);
  const userPinned = pinnedTracks?.[0];
  const speakers = useSpeakingParticipants();
  const { localParticipant } = useLocalParticipant();
  const localIdentity = localParticipant?.identity ?? null;

  // Only count an actively-publishing screenshare. A stale publication left
  // over after someone stopped sharing has the same source but no live track,
  // and otherwise locks us into the focus layout with the sharer's avatar.
  const screenShare = tracks.find(
    (t) =>
      isTrackReference(t) &&
      t.publication?.source === Track.Source.ScreenShare &&
      !t.publication.isMuted &&
      Boolean(t.publication.track),
  );

  const liveCameras = tracks.filter(
    (t) =>
      isTrackReference(t) &&
      t.publication?.source === Track.Source.Camera &&
      Boolean(t.publication.track) &&
      !t.publication.isMuted,
  );

  // Focus layout only when there's something specific to focus on: an explicit
  // user pin or an active screenshare. Otherwise fall back to the equal-sized
  // grid so participants stay the same size.
  const focusTrack = userPinned ?? screenShare;
  // Reference equality breaks across renders: usePinnedTracks holds the
  // TrackReference snapshot from pin time, while useTracks may return a fresh
  // object for the same (participant, source). Without isEqualTrackRef the
  // pinned track survives the filter and renders twice (focus + carousel).
  const carouselTracks = focusTrack
    ? tracks.filter((t) => !isEqualTrackRef(t, focusTrack))
    : tracks;

  // Tell the widget what kind of single-video PiP target exists — screenshare
  // wins; otherwise any live camera. Document PiP doesn't need this signal
  // (it shows the whole UI) but the widget uses it for the fallback path on
  // browsers without document PiP support.
  const { setPopOutCandidate, requestTogglePopOut, isInDocumentPiP } =
    useContext(MatrixCallPortalContext);
  // Document PiP only — the whole call view goes into an OS window. Hidden
  // entirely on browsers that don't support it (a permanent capability gap).
  const pipSupported =
    typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  useEffect(() => {
    if (screenShare) {
      setPopOutCandidate('screen_share');
    } else if (liveCameras.length > 0) {
      setPopOutCandidate('camera');
    } else {
      setPopOutCandidate(null);
    }
  }, [screenShare, liveCameras.length, setPopOutCandidate]);

  useEffect(() => {
    return () => setPopOutCandidate(null);
  }, [setPopOutCandidate]);

  // Floating widget is too small for a useful grid/carousel. Show a single
  // tile: an active screenshare wins (you usually peek at the widget to keep
  // an eye on shared content), then whoever's actively talking (debounced so
  // short utterances don't flap the view), then any live camera, then any
  // track at all so something always renders. Self is excluded from the
  // speaker pick — in a 1-on-1 you want to see the other person, not yourself.
  const remoteSpeakerId =
    speakers.find((p) => p.identity !== localIdentity)?.identity ?? null;
  const stableSpeakerId = useStableSpeaker(
    remoteSpeakerId,
    COMPACT_SPEAKER_DEBOUNCE_MS,
  );
  // Match by `source` (not `isTrackReference`) so a mic-only speaker still
  // surfaces via their Camera placeholder tile (avatar + name).
  const speakerTrack = stableSpeakerId
    ? tracks.find(
        (t) =>
          t.source === Track.Source.Camera &&
          t.participant?.identity === stableSpeakerId,
      )
    : undefined;
  const otherLiveCameras = localIdentity
    ? liveCameras.filter(
        (t) => isTrackReference(t) && t.participant.identity !== localIdentity,
      )
    : [];
  const otherAnyTracks = localIdentity
    ? tracks.filter(
        (t) =>
          t.participant?.identity && t.participant.identity !== localIdentity,
      )
    : [];
  const compactTrack = compact
    ? (screenShare ?? speakerTrack ?? otherLiveCameras[0] ?? otherAnyTracks[0])
    : undefined;

  return (
    <div className="d-flex flex-column h-100">
      <div className="position-relative flex-grow-1 overflow-hidden">
        {compact ? (
          compactTrack ? (
            <FocusLayout trackRef={compactTrack} style={{ height: '100%' }} />
          ) : null
        ) : focusTrack ? (
          <FocusLayoutContainer style={{ height: '100%' }}>
            <CarouselLayout tracks={carouselTracks}>
              <ParticipantTile />
            </CarouselLayout>
            <FocusLayout trackRef={focusTrack} />
          </FocusLayoutContainer>
        ) : (
          <GridLayout tracks={tracks} style={{ height: '100%' }}>
            <ParticipantTile />
          </GridLayout>
        )}
      </div>
      {/* Custom control bar (instead of LiveKit's <ControlBar variation="minimal">)
          so each icon-only button carries a tooltip explaining what it does.
          TrackToggle / DisconnectButton are the same primitives ControlBar uses
          internally, so the .lk-* styling is unchanged. The four primary
          controls (mic, camera, screen-share, end-call) match the mockup. */}
      <div className="lk-control-bar">
        <Tip
          id="call-mic"
          label={translate('Toggle microphone')}
          placement="top"
          container={overlayContainer}
        >
          <TrackToggle source={Track.Source.Microphone} />
        </Tip>
        <Tip
          id="call-camera"
          label={translate('Toggle camera')}
          placement="top"
          container={overlayContainer}
        >
          <TrackToggle source={Track.Source.Camera} />
        </Tip>
        <Tip
          id="call-screenshare"
          label={translate('Share your screen')}
          placement="top"
          container={overlayContainer}
        >
          <TrackToggle source={Track.Source.ScreenShare} />
        </Tip>
        {/* Settings / fullscreen / PiP live on the control bar alongside the
            primary controls. Hidden in the cramped floating widget. */}
        {!compact && (
          <>
            <CallSettingsMenu container={overlayContainer} />
            {fullscreenSupported && (
              <Tip
                id="call-fullscreen"
                label={
                  isFullscreen
                    ? translate('Exit fullscreen')
                    : translate('Enter fullscreen')
                }
                placement="top"
                container={overlayContainer}
              >
                <button
                  type="button"
                  className="lk-button"
                  onClick={toggleFullscreen}
                  aria-label={
                    isFullscreen
                      ? translate('Exit fullscreen')
                      : translate('Enter fullscreen')
                  }
                >
                  {isFullscreen ? (
                    <CornersInIcon size={20} weight="bold" />
                  ) : (
                    <CornersOutIcon size={20} weight="bold" />
                  )}
                </button>
              </Tip>
            )}
            {pipSupported && (
              <Tip
                id="call-pip"
                label={
                  isInDocumentPiP
                    ? translate('Close Picture-in-Picture')
                    : translate('Open in Picture-in-Picture')
                }
                placement="top"
                container={overlayContainer}
              >
                <button
                  type="button"
                  className="lk-button"
                  onClick={requestTogglePopOut}
                  aria-label={
                    isInDocumentPiP
                      ? translate('Close Picture-in-Picture')
                      : translate('Open in Picture-in-Picture')
                  }
                >
                  <PictureInPictureIcon size={20} weight="bold" />
                </button>
              </Tip>
            )}
          </>
        )}
        <Tip
          id="call-leave"
          label={translate('Leave call')}
          placement="top"
          container={overlayContainer}
        >
          <DisconnectButton>
            <PhoneSlashIcon size={20} weight="bold" />
          </DisconnectButton>
        </Tip>
      </div>
    </div>
  );
};

const ConnectingPlaceholder: FC = () => (
  <div className="matrix-call-view__connecting">
    <LoadingSpinnerSimple />
    <span>{translate('Starting call…')}</span>
  </div>
);

const CallErrorPanel: FC<{
  message: string | null;
  onRetry: () => void;
  onClose: () => void;
}> = ({ message, onRetry, onClose }) => (
  <div className="matrix-call-view__error">
    <LoadingErred
      loadData={onRetry}
      message={message || translate('Could not connect to the call.')}
    />
    <button type="button" className="btn btn-sm btn-light" onClick={onClose}>
      {translate('Close')}
    </button>
  </div>
);

const MatrixCallView: FC<{
  compact?: boolean;
  fullscreenTarget?: HTMLElement | null;
}> = ({ compact = false, fullscreenTarget }) => {
  const {
    credentials,
    callState,
    error,
    startCall,
    endCall,
    markConnected,
    callMembers,
  } = useMatrixCall();
  const { userId } = useMatrixClient();
  const currentUser = useUser();
  const containerRef = useRef<HTMLDivElement>(null);

  // Confine the LiveKit log-level mutation to the component's lifetime.
  useEffect(() => {
    setLogLevel('error');
  }, []);

  const displayName =
    currentUser?.full_name || (userId ? formatDisplayName(userId) : '');

  const identityEntries = useMemo<IdentityEntry[]>(() => {
    const myDeviceId = sessionStorage.getItem(DEVICE_ID_KEY) || '';
    const entries: IdentityEntry[] = callMembers.map((m: CallMemberInfo) => ({
      userId: m.userId,
      deviceId: m.deviceId,
      displayName: m.displayName,
    }));
    if (userId && myDeviceId && displayName) {
      entries.push({
        userId,
        deviceId: myDeviceId,
        displayName,
      });
    }
    return entries;
  }, [callMembers, userId, displayName]);

  const identityMap = useIdentityNameMap(identityEntries);

  // Cover the LiveKit handshake so the bare ParticipantTile placeholder doesn't
  // flash into the dock between discovering and connected. The error state is
  // handled separately so a failed call shows why instead of spinning forever.
  const showConnecting =
    callState === 'discovering' || callState === 'connecting';

  return (
    <div
      ref={containerRef}
      className={`matrix-call-view flex-grow-1 overflow-hidden${compact ? ' matrix-call-view--compact' : ''}`}
      data-lk-theme="default"
    >
      {credentials && (
        <LiveKitRoom
          serverUrl={credentials.url}
          token={credentials.jwt}
          connect
          audio={false}
          video={false}
          onConnected={markConnected}
          // A user-initiated hang-up ends cleanly; any other disconnect
          // (server gone, signal lost) keeps the room anchored so the error
          // panel stays docked instead of detaching into the floating widget.
          onDisconnected={(reason) =>
            reason === DisconnectReason.CLIENT_INITIATED
              ? endCall()
              : endCall(translate('Could not connect to the call.'))
          }
          onError={() => endCall(translate('Could not connect to the call.'))}
          style={{ height: '100%' }}
        >
          <LayoutContextProvider>
            <CallStage
              compact={compact}
              containerRef={containerRef}
              fullscreenTarget={fullscreenTarget}
            />
          </LayoutContextProvider>
          <RoomAudioRenderer />
          <NameOverrider
            containerRef={containerRef}
            identityMap={identityMap}
            localDisplayName={displayName}
          />
        </LiveKitRoom>
      )}
      {showConnecting && <ConnectingPlaceholder />}
      {callState === 'error' && (
        <CallErrorPanel
          message={error}
          onRetry={startCall}
          onClose={() => endCall()}
        />
      )}
    </div>
  );
};

export default MatrixCallView;

import {
  BroadcastIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  adminMatrixLivekitParticipantsList,
  LiveKitParticipant,
  LiveKitTrack,
} from 'waldur-js-client';

import { formatRelative } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import {
  formatTrackKind,
  formatTrackResolution,
  getErrorDetail,
  isVideoTrack,
} from './liveKitFormatters';

const TrackGlyph: FC<{ track: LiveKitTrack }> = ({ track }) => {
  if (isVideoTrack(track)) {
    return track.muted ? (
      <VideoCameraSlashIcon weight="bold" className="text-muted" />
    ) : (
      <VideoCameraIcon weight="bold" />
    );
  }
  return track.muted ? (
    <MicrophoneSlashIcon weight="bold" className="text-muted" />
  ) : (
    <MicrophoneIcon weight="bold" />
  );
};

const TrackRow: FC<{ track: LiveKitTrack }> = ({ track }) => {
  const resolution = formatTrackResolution(track);
  return (
    <div className="d-flex align-items-center gap-2 text-muted fs-7">
      <TrackGlyph track={track} />
      <span>{formatTrackKind(track)}</span>
      {resolution && <span>{resolution}</span>}
      {track.muted && <span>({translate('muted')})</span>}
    </div>
  );
};

const ParticipantRow: FC<{ participant: LiveKitParticipant }> = ({
  participant,
}) => (
  <div className="border-bottom py-3">
    <div className="d-flex align-items-center justify-content-between">
      <span className="fw-bold">{participant.identity}</span>
      <span
        className={
          participant.state === 'ACTIVE'
            ? 'badge badge-light-success'
            : 'badge badge-light'
        }
      >
        {participant.state}
      </span>
    </div>
    <div className="text-muted fs-7 mb-2 d-flex align-items-center gap-2">
      {participant.is_publisher && (
        <span className="d-flex align-items-center gap-1">
          <BroadcastIcon weight="bold" /> {translate('Publisher')}
        </span>
      )}
      {participant.joined_at ? (
        <span>
          {translate('Joined')} {formatRelative(participant.joined_at * 1000)}
        </span>
      ) : (
        <span>{translate('Unknown time')}</span>
      )}
    </div>
    {participant.tracks.map((track) => (
      <TrackRow key={track.sid} track={track} />
    ))}
  </div>
);

interface LiveKitRoomDetailsProps {
  roomName: string;
}

// Rendered inline as the expandable detail of a room row; only mounted while the
// row is expanded, so collapsed rooms don't poll.
export const LiveKitRoomDetails: FC<LiveKitRoomDetailsProps> = ({
  roomName,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['liveKitParticipants', roomName],
    queryFn: () =>
      adminMatrixLivekitParticipantsList({
        query: { room: roomName },
      }).then((r) => r.data),
    enabled: Boolean(roomName),
    refetchInterval: 10_000,
    retry: false,
    // Render our own error UI; don't let a failed poll trip the global handler.
    meta: { skipGlobalErrorRedirect: true },
  });

  // isLoading is v5's "fetching with no data yet" — the initial load only, so
  // polling refetches don't flicker the spinner.
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        message={getErrorDetail(error) || translate('LiveKit is unreachable.')}
        loadData={refetch}
      />
    );
  }
  if (data && data.length > 0) {
    return (
      <>
        {data.map((participant) => (
          <ParticipantRow key={participant.sid} participant={participant} />
        ))}
      </>
    );
  }
  return (
    <p className="text-muted mb-0">
      {translate('No participants in this room.')}
    </p>
  );
};

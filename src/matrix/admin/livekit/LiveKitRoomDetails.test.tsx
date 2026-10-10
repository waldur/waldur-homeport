import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminMatrixLivekitParticipantsList,
  LiveKitParticipant,
  LiveKitTrack,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { LiveKitRoomDetails } from './LiveKitRoomDetails';

const track = (overrides: Partial<LiveKitTrack>): LiveKitTrack => ({
  sid: 'TR_1',
  name: '',
  type: 'AUDIO',
  muted: false,
  width: 0,
  height: 0,
  source: 'MICROPHONE',
  encryption: 'GCM',
  ...overrides,
});

const participant = (tracks: LiveKitTrack[]): LiveKitParticipant => ({
  sid: 'PA_1',
  identity: '@alice:example.com:DEVICE',
  state: 'ACTIVE',
  is_publisher: true,
  joined_at: 0,
  tracks,
});

const renderWithTracks = (tracks: LiveKitTrack[]) => {
  vi.mocked(adminMatrixLivekitParticipantsList).mockResolvedValue({
    data: [participant(tracks)],
  } as any);
  return renderWithProviders(<LiveKitRoomDetails roomName="room1" />);
};

describe('LiveKitRoomDetails', () => {
  beforeEach(() => {
    vi.mocked(adminMatrixLivekitParticipantsList).mockReset();
  });

  it('marks each track by how it is encrypted', async () => {
    renderWithTracks([
      track({ sid: 'TR_1', encryption: 'GCM' }),
      track({ sid: 'TR_2', encryption: 'CUSTOM' }),
      track({ sid: 'TR_3', encryption: 'NONE' }),
      track({ sid: 'TR_4', encryption: 'AES' }),
    ]);
    expect(await screen.findByText('Encrypted')).toBeInTheDocument();
    expect(screen.getByText('Encrypted (custom)')).toBeInTheDocument();
    expect(screen.getByText('Not encrypted')).toBeInTheDocument();
    expect(screen.getByText('Encryption unknown')).toBeInTheDocument();
  });

  it('never shows an unknown value as encrypted', async () => {
    renderWithTracks([track({ encryption: 'gcm' })]);
    expect(await screen.findByText('Encryption unknown')).toBeInTheDocument();
    expect(screen.queryByText('Encrypted')).not.toBeInTheDocument();
  });

  it('names a track by its source', async () => {
    renderWithTracks([
      track({ sid: 'TR_1', type: 'VIDEO', source: 'SCREEN_SHARE' }),
    ]);
    expect(await screen.findByText('Screen share')).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { matrixRoomsCommandsList } from 'waldur-js-client';

import { fetchRoomCommands } from './api';

describe('fetchRoomCommands', () => {
  it('maps the backend’s commands to bot commands, dropping empty text', async () => {
    vi.mocked(matrixRoomsCommandsList).mockResolvedValue({
      data: [
        {
          name: 'ticket',
          description: 'Draft a support ticket',
          hint: '[description]',
          available: true,
          reason: '',
        },
        {
          name: 'ticket send',
          description: '',
          hint: '',
          available: false,
          reason: 'You have no open ticket draft in this room.',
        },
      ],
    } as any);
    await expect(fetchRoomCommands('room-1')).resolves.toEqual([
      {
        name: 'ticket',
        description: 'Draft a support ticket',
        args: '[description]',
        source: 'bot',
        available: true,
        reason: undefined,
      },
      {
        name: 'ticket send',
        description: undefined,
        args: undefined,
        source: 'bot',
        available: false,
        reason: 'You have no open ticket draft in this room.',
      },
    ]);
    expect(matrixRoomsCommandsList).toHaveBeenCalledWith({
      path: { uuid: 'room-1' },
    });
  });
});

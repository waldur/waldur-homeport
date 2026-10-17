import { matrixRoomsCommandsList } from 'waldur-js-client';

import { ComposerCommand } from './composerCommands';

/** The room bot's commands, and whether each works for the user here. */
export const fetchRoomCommands = (roomUuid: string) =>
  matrixRoomsCommandsList({ path: { uuid: roomUuid } }).then(({ data }) =>
    data.map((command): ComposerCommand => ({
      name: command.name,
      description: command.description || undefined,
      args: command.hint || undefined,
      source: 'bot',
      available: command.available,
      reason: command.reason || undefined,
    })),
  );

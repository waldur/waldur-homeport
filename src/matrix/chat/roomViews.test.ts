import { describe, expect, it } from 'vitest';

import { isRoomOpenElsewhere } from './roomViews';

describe('isRoomOpenElsewhere', () => {
  it.each([
    ['another room is open', 'connected', 'other', 'other', true],
    ['another room is opening first', 'connected', null, 'other', true],
    ['this room is opening', 'connected', 'other', 'mine', false],
    ['this room is open', 'connected', 'mine', 'mine', false],
    ['no room was asked for yet', 'connected', null, null, false],
    ['the client is connecting', 'connecting', 'other', 'other', false],
  ] as const)(
    'when %s',
    (_, connectionState, activeRoomUuid, requestedRoomUuid, expected) => {
      expect(
        isRoomOpenElsewhere(
          { connectionState, activeRoomUuid, requestedRoomUuid },
          'mine',
        ),
      ).toBe(expected);
    },
  );
});

import { removeWeekends } from '@waldur/booking/components/calendar/utils';

import { eventBefore, eventsAfter } from './events.fixture';

describe('If weekends are off, remove weekends by splitting the event', () => {
  it('splits the event', () => {
    expect(removeWeekends(eventBefore)).toEqual(
      expect.arrayContaining(eventsAfter),
    );
  });
});

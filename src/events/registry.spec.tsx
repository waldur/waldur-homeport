import { event } from './fixtures';
import { EventRegistry } from './registry';

describe('Event registry', () => {
  let registry: EventRegistry;

  beforeEach(() => {
    registry = new EventRegistry();
  });

  it('returns event message as is by default', () => {
    expect(registry.formatEvent(event)).toBe(event.message);
  });

  it('uses custom formatter if possible', () => {
    registry.registerGroup({
      title: 'User events',
      events: [
        {
          key: event.event_type,
          title: 'User {user} authenticated successfully.',
          formatter: (e) =>
            `User ${e.user_full_name} authenticated successfully.`,
        },
      ],
    });
    expect(registry.formatEvent(event)).toMatchSnapshot();
  });

  it('uses custom context if possible', () => {
    registry.registerGroup({
      title: 'User events',
      context: (e) => ({
        user_link: <a href={e.user_uuid}>{e.user_full_name}</a>,
      }),
      events: [
        {
          key: event.event_type,
          title: 'User {user_link} authenticated successfully.',
        },
      ],
    });
    expect(registry.formatEvent(event)).toMatchSnapshot();
  });

  it('uses event context as is by default', () => {
    registry.registerGroup({
      title: 'User events',
      events: [
        {
          key: event.event_type,
          title: 'User {user_full_name} authenticated successfully.',
        },
      ],
    });
    expect(registry.formatEvent(event)).toMatchSnapshot();
  });
});

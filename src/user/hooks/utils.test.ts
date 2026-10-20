import { describe, expect, it, vi } from 'vitest';
import { eventsEventGroupsRetrieve } from 'waldur-js-client';

import { formatEventTitle, loadEventGroupsOptions } from './utils';

describe('event group labels', () => {
  it('uses the authored title for a known group', () => {
    expect(formatEventTitle('auth')).toBe('Sign-ins and access tokens');
  });

  it('falls back to the derived title for an unknown group', () => {
    expect(formatEventTitle('future_group')).toBe('Future group events');
  });

  it('orders options by section and never exposes raw event types', async () => {
    vi.mocked(eventsEventGroupsRetrieve).mockResolvedValue({
      data: {
        support: ['issue_creation_succeeded'],
        future_group: ['x'],
        auth: ['auth_logged_out'],
      },
    } as any);
    const options = await loadEventGroupsOptions();
    expect(options.map((o) => o.key)).toEqual([
      'auth',
      'support',
      'future_group',
    ]);
    expect(JSON.stringify(options)).not.toContain('auth_logged_out');
    expect(options[2].section).toBeUndefined();
  });
});

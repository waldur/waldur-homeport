import { describe, expect, it } from 'vitest';

import { SHARED_CHAT_FILTERS, otherChannel } from './sharedChatFilters';

describe('SHARED_CHAT_FILTERS', () => {
  it('names both channels for every concept', () => {
    SHARED_CHAT_FILTERS.forEach((shared) => {
      expect(shared.authenticated).toBeTruthy();
      expect(shared.anonymous).toBeTruthy();
    });
  });

  it('claims each field name at most once per channel', () => {
    // A name listed twice would make the mirror's last write win silently.
    const authenticated = SHARED_CHAT_FILTERS.map((s) => s.authenticated);
    const anonymous = SHARED_CHAT_FILTERS.map((s) => s.anonymous);

    expect(new Set(authenticated).size).toBe(authenticated.length);
    expect(new Set(anonymous).size).toBe(anonymous.length);
  });

  it('pairs the concepts the two channels name differently', () => {
    const mapped = SHARED_CHAT_FILTERS.filter(
      (s) => s.authenticated !== s.anonymous,
    );

    expect(mapped).toEqual([
      { authenticated: 'modified_range', anonymous: 'last_active_range' },
      { authenticated: 'max_severity', anonymous: 'severity' },
    ]);
  });

  it('leaves per-channel fields out', () => {
    // user/user_slug are different entities (a Waldur account vs a salted
    // visitor hash) and is_archived has no anonymous counterpart, so none of
    // them can carry a value across.
    const names = SHARED_CHAT_FILTERS.flatMap((s) => [
      s.authenticated,
      s.anonymous,
    ]);

    expect(names).not.toContain('user');
    expect(names).not.toContain('user_slug');
    expect(names).not.toContain('is_archived');
  });
});

describe('otherChannel', () => {
  it('returns the opposite channel', () => {
    expect(otherChannel('authenticated')).toBe('anonymous');
    expect(otherChannel('anonymous')).toBe('authenticated');
  });
});

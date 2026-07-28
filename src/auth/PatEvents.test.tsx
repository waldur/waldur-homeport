import { render } from '@testing-library/react';
import { describe, beforeEach, it, expect } from 'vitest';

import { EventRegistry } from '@/events/registry';
import { AuthEnum } from '@/EventsEnums';

import { PatEvents } from './PatEvents';

// These events are never reachable from the profile Audit logs tab, which is
// pinned to feature=users while the PAT event types live in EventGroup.AUTH.
// That makes the rendering untestable by clicking through the UI, so it is
// pinned down here instead.
describe('PatEvents', () => {
  let registry: EventRegistry;

  beforeEach(() => {
    registry = new EventRegistry();
    registry.registerGroup(PatEvents);
  });

  const asText = (context: Record<string, any>) => {
    const formatted = registry.formatEvent({
      event_type: context.event_type,
      message: 'raw backend message',
      context,
    } as any);
    const { container } = render(<>{formatted}</>);
    return container.textContent;
  };

  const baseContext = {
    pat_name: 'ci token',
    affected_user_uuid: 'u-1',
    affected_user_username: 'alice',
    affected_user_full_name: 'Alice Example',
  };

  it.each([
    AuthEnum.pat_created,
    AuthEnum.pat_revoked,
    AuthEnum.pat_rotated,
    AuthEnum.pat_expired,
    AuthEnum.pat_used_from_new_ip,
    AuthEnum.pat_access_denied_from_ip,
    AuthEnum.pat_authentication_rejected,
    AuthEnum.pat_network_acl_updated,
  ])('registers a formatter for %s that replaces the raw message', (key) => {
    const text = asText({ ...baseContext, event_type: key, reason: 'revoked' });
    expect(text).not.toBe('raw backend message');
    expect(text).toContain('ci token');
  });

  it('renders the affected user, not a blank {user_link}', () => {
    // pat_used_from_new_ip is emitted from PATAuthentication.authenticate,
    // outside a user-context request, so only affected_user_* is populated.
    const text = asText({
      ...baseContext,
      event_type: AuthEnum.pat_used_from_new_ip,
    });
    expect(text).toContain('Alice Example');
  });

  it.each([
    ['revoked', 'the token has been revoked'],
    ['user_inactive', 'the owner account is inactive'],
    [
      'permission_revoked',
      'the owner may no longer use personal access tokens',
    ],
  ])('renders a readable label for reason=%s', (reason, label) => {
    const text = asText({
      ...baseContext,
      event_type: AuthEnum.pat_authentication_rejected,
      reason,
    });
    expect(text).toContain(label);
  });

  it('falls back to the raw reason when the backend adds a new one', () => {
    const text = asText({
      ...baseContext,
      event_type: AuthEnum.pat_authentication_rejected,
      reason: 'some_future_reason',
    });
    expect(text).toContain('some_future_reason');
  });
});

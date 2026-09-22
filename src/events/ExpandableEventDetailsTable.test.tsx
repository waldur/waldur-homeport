import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ExpandableEventDetailsTable } from './ExpandableEventDetailsTable';
import { Event } from './types';

const event = (event_type: string, context: Record<string, any>): Event =>
  ({
    uuid: 'e1',
    event_type,
    message: 'Role CUSTOMER.AUDITED has been updated.',
    created: '2026-09-22T00:00:00Z',
    context,
  }) as unknown as Event;

describe('Role definition row', () => {
  it('is absent when the event carries no definition delta', () => {
    // ExpandableEventField drops a falsy value, but a JSX element is truthy
    // even when the component renders nothing: gating on the event type alone
    // left this label standing above an empty column.
    render(
      <ExpandableEventDetailsTable
        event={event('role_definition_updated', {
          added_permissions: [],
          removed_permissions: [],
        })}
        isStaffOrSupport={false}
      />,
    );
    expect(screen.queryByText(/^Role definition:?$/)).toBeNull();
  });

  it('is present for a description-only edit', () => {
    render(
      <ExpandableEventDetailsTable
        event={event('role_definition_updated', {
          old_descriptions: { description: 'Old text' },
          new_descriptions: { description: 'New text' },
        })}
        isStaffOrSupport={false}
      />,
    );
    expect(screen.queryByText(/^Role definition:?$/)).not.toBeNull();
    expect(
      screen.queryByText('Description: "Old text" to "New text".'),
    ).not.toBeNull();
  });
});

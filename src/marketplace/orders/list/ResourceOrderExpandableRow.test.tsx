import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResourceOrderExpandableRow } from './ResourceOrderExpandableRow';

const row = (overrides = {}) =>
  ({
    uuid: 'o1',
    state: 'erred',
    error_message: '',
    error_traceback: '',
    ...overrides,
  }) as any;

describe('ResourceOrderExpandableRow', () => {
  it('shows why an order failed', () => {
    render(
      <ResourceOrderExpandableRow
        row={row({
          error_message: 'API error 500: "Unable to remove user with buckets."',
        })}
      />,
    );
    expect(screen.getByText(/Unable to remove user with buckets/)).toBeTruthy();
  });

  it('stays empty for an order that did not fail', () => {
    // The reason is per-attempt, so a successful order must not inherit the
    // previous failure's text.
    render(<ResourceOrderExpandableRow row={row({ state: 'done' })} />);
    expect(screen.queryByText('Error message')).toBeNull();
  });
});

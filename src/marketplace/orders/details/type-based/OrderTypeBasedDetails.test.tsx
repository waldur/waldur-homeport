import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrderTypeBasedDetails } from './OrderTypeBasedDetails';

vi.mock('./LimitsUpdate', () => ({
  LimitsUpdate: () => <div>limits change</div>,
}));
vi.mock('./OptionsUpdate', () => ({
  OptionsUpdate: () => <div>options change</div>,
}));

const buildOrder = (attributes) =>
  ({
    type: 'Update',
    created: '2026-09-29T10:00:00Z',
    created_by_full_name: 'Staff',
    created_by_username: 'staff',
    limits: { data: 600 },
    attributes,
  }) as any;

describe('OrderTypeBasedDetails', () => {
  it('shows both halves of a changed formula input', () => {
    render(
      <OrderTypeBasedDetails
        order={buildOrder({
          old_limits: { data: 400 },
          old_options: {},
          new_options: { storage: 300 },
        })}
        offering={{} as any}
      />,
    );
    expect(screen.getByText('limits change')).toBeInTheDocument();
    expect(screen.getByText('options change')).toBeInTheDocument();
  });

  it('shows a plain limit change alone', () => {
    render(
      <OrderTypeBasedDetails
        order={buildOrder({ old_limits: { data: 400 } })}
        offering={{} as any}
      />,
    );
    expect(screen.getByText('limits change')).toBeInTheDocument();
    expect(screen.queryByText('options change')).not.toBeInTheDocument();
  });
});

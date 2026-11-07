import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AssignmentStatusBadge } from './AssignmentStatusBadge';

const badge = (text: string) =>
  // The badge carries no role to query it by.
  // eslint-disable-next-line testing-library/no-node-access
  screen.getByText(text).closest('[data-variant]');

describe('AssignmentStatusBadge', () => {
  it('says an item of a draft batch is not sent yet', () => {
    render(
      <AssignmentStatusBadge
        status="pending"
        statusDisplay="Awaiting response"
        batchStatus="draft"
      />,
    );

    expect(screen.queryByText('Awaiting response')).not.toBeInTheDocument();
    expect(badge('Not sent yet')).toHaveAttribute('data-variant', 'neutral');
  });

  it('shows a sent item awaiting its response', () => {
    render(
      <AssignmentStatusBadge
        status="pending"
        statusDisplay="Awaiting response"
        batchStatus="sent"
      />,
    );

    expect(badge('Awaiting response')).toHaveAttribute(
      'data-variant',
      'warning',
    );
  });

  it('shows an expired item in grey, not in the brand colour', () => {
    render(<AssignmentStatusBadge status="expired" statusDisplay="Expired" />);

    expect(badge('Expired')).toHaveAttribute('data-variant', 'neutral');
  });
});

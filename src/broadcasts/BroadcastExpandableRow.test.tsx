import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BroadcastExpandableRow } from './BroadcastExpandableRow';

const row: any = {
  body: 'Scheduled maintenance on Friday.',
  send_at: '2026-04-24T11:50:00Z',
  query: {
    customers: [{ id: 1, name: 'Nordic Cloud' }],
    offerings: [{ id: 2, name: 'Tartu HPC' }],
  },
};

describe('BroadcastExpandableRow', () => {
  it('lists the column as one description list', () => {
    const { container } = renderWithProviders(
      <BroadcastExpandableRow row={row} />,
    );

    // The rows come from three components; they belong to one `<dl>`, so a
    // screen reader reads one list and the labels line up down the column.
    // No Testing Library query counts description lists.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('dl')).toHaveLength(1);
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual([
      'Organizations:',
      'Offerings:',
      'Recipients:',
      'Send at:',
    ]);
  });

  it('gives every row the width the list states', () => {
    const { container } = renderWithProviders(
      <BroadcastExpandableRow row={row} />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const dl = container.querySelector('dl');
    expect(dl?.style.getPropertyValue('--dt-width')).toBe('40%');
  });
});

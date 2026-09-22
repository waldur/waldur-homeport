import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OfferingMergeCheck } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { MergeCheckDetailsDialog } from './MergeCheckDetailsDialog';

const check: OfferingMergeCheck = {
  code: 'resources_moved',
  passed: false,
  details: {
    moved_resources: 12000,
    offerings: { 'offering-a': 'Cluster A' },
    missing: ['res-1', 'res-2'],
    recomputed: true,
    note: null,
  },
};

describe('MergeCheckDetailsDialog', () => {
  it('renders the payload by shape instead of one line of JSON', () => {
    renderWithProviders(<MergeCheckDetailsDialog resolve={{ check }} />);

    // Object keys become labels, numbers are formatted, lists are lists.
    expect(screen.getByText('Moved resources')).toBeInTheDocument();
    expect(
      screen.getByText((12000).toLocaleString(), { selector: 'dd' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cluster A')).toBeInTheDocument();
    expect(screen.getByText('res-1', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByText('res-2', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('keeps the raw payload available underneath', () => {
    renderWithProviders(<MergeCheckDetailsDialog resolve={{ check }} />);

    const raw = screen.getByTestId('merge-check-raw');
    expect(raw).toHaveTextContent('Raw payload');
    expect(raw).toHaveTextContent('"moved_resources": 12000');
    expect(raw).toHaveTextContent('"missing"');
  });

  it('shows the result of the check without leaving the row', () => {
    renderWithProviders(<MergeCheckDetailsDialog resolve={{ check }} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('resources_moved')).toBeInTheDocument();
  });
});

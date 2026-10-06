import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RoundExpandableRow } from './RoundExpandableRow';

const round = {
  uuid: 'round-uuid',
  name: 'Round 1',
  start_time: '2026-01-01T00:00:00Z',
  cutoff_time: '2026-02-01T00:00:00Z',
  status: 'ended',
  lifecycle_state: 'deciding',
  adopted_at: '2026-02-10T00:00:00Z',
  adoption_note: null,
  adoption_document: null,
  results_forced_reason: null,
  held_decisions_count: null,
} as any;

const call = {
  undecided_at_round_completion: 'refuse',
  publish_results: 'with_round',
} as any;

const renderRow = (roundProps = {}, callProps = {}) =>
  renderWithProviders(
    <RoundExpandableRow
      row={{ ...round, ...roundProps }}
      call={{ ...call, ...callProps }}
    />,
  );

describe('RoundExpandableRow adoption section', () => {
  it('leaves the section out while the record is withheld from the viewer', () => {
    renderRow();
    expect(screen.queryByTestId('round-adoption')).not.toBeInTheDocument();
    expect(screen.queryByText('Not recorded')).not.toBeInTheDocument();
  });

  it('shows the record to a viewer who may see held decisions', () => {
    renderRow({ held_decisions_count: 0, adoption_note: 'Board minutes' });
    expect(screen.getByTestId('round-adoption')).toHaveTextContent(
      'Board minutes',
    );
  });

  it('shows the record to everyone once the results are published', () => {
    renderRow({ lifecycle_state: 'results_published', adopted_at: null });
    expect(screen.getByTestId('round-adoption')).toHaveTextContent(
      'Not recorded',
    );
  });
});

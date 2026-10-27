import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { resourceRequestColumns } from './resourceRequestColumns';

const row = {
  requested_offering: {
    offering_name: 'HPC',
    options: {
      order: ['qos', 'partition'],
      options: {
        qos: { type: 'select_string', label: 'QoS', required: true },
        partition: { type: 'select_string', label: 'Partition' },
      },
    },
  },
  attributes: { partition: 'cpu' },
} as any;

const renderOfferingCell = (options = {}) => {
  const Cell = resourceRequestColumns(options)[0].render as any;
  render(<Cell row={row} />);
};

describe('resourceRequestColumns offering cell', () => {
  it('shows the options the request answers', () => {
    renderOfferingCell();
    expect(screen.getByText('HPC')).toBeInTheDocument();
    expect(screen.getByText('Partition: cpu')).toBeInTheDocument();
  });

  // waldur/waldur-homeport#129 on GitHub: the applicant is told what blocks
  // the proposal, where they can still fix it.
  it('names a missing required option where the request can be edited', () => {
    renderOfferingCell({ showMissingOptions: true });
    expect(screen.getByText('Missing: QoS')).toBeInTheDocument();
  });

  // A reviewer or call manager reading a submitted proposal cannot.
  it('keeps the hint out of read-only listings', () => {
    renderOfferingCell();
    expect(screen.queryByText(/Missing:/)).not.toBeInTheDocument();
  });
});

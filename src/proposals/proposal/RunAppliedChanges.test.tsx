import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RunAppliedChanges, RunStateCell } from './RunAppliedChanges';

const run = (state: string, applied_changes: Record<string, unknown>) =>
  ({
    uuid: 'run-1',
    phase: 'extension',
    state,
    applied_changes,
  }) as any;

const skippedStorage = {
  project_end_date: { previous: '2028-03-08', end_date: '2028-06-30' },
  resource_end_dates: [],
  orders: [],
  skipped: [
    {
      resource_uuid: 'res-storage',
      reason: 'The resource is not in OK state.',
    },
  ],
};

describe('RunStateCell', () => {
  it('warns when an approved run left some of its grant undone', () => {
    render(<RunStateCell row={run('approved', skippedStorage)} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByTestId('run-partly-applied')).toHaveTextContent(
      'Not all of it was carried out',
    );
  });

  it('raises no warning when everything was carried out', () => {
    render(
      <RunStateCell
        row={run('approved', {
          ...skippedStorage,
          orders: [{ resource_uuid: 'res-storage', order_uuid: 'o-1' }],
          skipped: [],
        })}
      />,
    );
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.queryByTestId('run-partly-applied')).not.toBeInTheDocument();
  });
});

describe('RunAppliedChanges', () => {
  it('lists what the approval changed and what it skipped, and why', () => {
    render(
      <RunAppliedChanges
        run={run('approved', {
          ...skippedStorage,
          resource_end_dates: [
            {
              resource_uuid: 'res-hpc',
              previous: '2028-03-08',
              end_date: '2028-06-30',
            },
          ],
          orders: [{ resource_uuid: 'res-hpc', order_uuid: 'o-1' }],
        })}
        resourceNames={{
          'res-storage': 'Storage allocation',
          'res-hpc': 'HPC allocation',
        }}
      />,
    );
    const applied = screen.getByTestId('run-applied-changes');
    expect(applied).toHaveTextContent('Project end date moved from');
    expect(applied).toHaveTextContent('HPC allocation: end date moved from');
    expect(applied).toHaveTextContent(
      'HPC allocation: more limits ordered, for its provider to approve',
    );
    expect(screen.getByTestId('run-skipped-changes')).toHaveTextContent(
      'Storage allocation: The resource is not in OK state.',
    );
  });

  it('names a resource the viewer cannot read generically', () => {
    render(
      <RunAppliedChanges
        run={run('approved', skippedStorage)}
        resourceNames={{}}
      />,
    );
    expect(screen.getByTestId('run-skipped-changes')).toHaveTextContent(
      'A resource: The resource is not in OK state.',
    );
  });

  it('renders nothing for a run that recorded no changes', () => {
    const { container } = render(
      <RunAppliedChanges run={run('open', {})} resourceNames={{}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceFlags } from './ResourceFlags';

const pastEnd = '2020-01-01';

const inGrace = {
  project_is_in_grace_period: true,
  resource_effective_end_date: pastEnd,
};

const expired = { project_effective_end_date: pastEnd };

const endsWithProject = {
  end_date: '2020-06-01',
  resource_effective_end_date: pastEnd,
};

const renderFlags = (resource) =>
  renderWithProviders(<ResourceFlags resource={resource as any} />);

describe('ResourceFlags', () => {
  it.each([
    ['In grace', inGrace],
    ['Expired', expired],
    ['Ends with project', endsWithProject],
  ])('shows %s while the resource is live', (label, resource) => {
    renderFlags({ state: 'OK', ...resource });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([
    ['In grace', inGrace, 'Terminated'],
    ['In grace', inGrace, 'Terminating'],
    ['Expired', expired, 'Terminated'],
    ['Expired', expired, 'Terminating'],
    ['Ends with project', endsWithProject, 'Terminated'],
    ['Ends with project', endsWithProject, 'Terminating'],
  ])('hides %s on a resource that is %s', (label, resource, state) => {
    renderFlags({ ...resource, state });

    expect(screen.queryByText(label)).not.toBeInTheDocument();
  });
});

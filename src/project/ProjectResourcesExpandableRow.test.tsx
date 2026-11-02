import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OfferingComponent, Resource } from 'waldur-js-client';

import {
  ResourceQuotaBar,
  ResourceQuotaFigures,
} from './ProjectResourcesExpandableRow';

const component = (overrides: Partial<OfferingComponent>) =>
  ({
    type: 'cpu',
    name: 'CPU',
    measured_unit: '',
    factor: 1,
    billing_type: 'limit',
    ...overrides,
  }) as OfferingComponent;

const renderCells = (
  components: OfferingComponent[],
  resource: Partial<Resource>,
) => {
  const props = {
    row: { offering_uuid: 'offering-1', ...resource } as Resource,
    offerings: [{ uuid: 'offering-1', components }],
    isLoading: false,
  };
  return render(
    <>
      <div data-testid="figures">
        <ResourceQuotaFigures {...props} />
      </div>
      <div data-testid="bar">
        <ResourceQuotaBar {...props} />
      </div>
    </>,
  );
};

describe('project resource quota cells', () => {
  it('shows used of total and the bar for the only limit', () => {
    renderCells([component({})], {
      limits: { cpu: 10 },
      limit_usage: { cpu: 4 },
    });

    expect(screen.getByTestId('figures')).toHaveTextContent(/^4\/10$/);
    expect(screen.getByRole('progressbar', { name: 'CPU' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    );
  });

  it('names the component closest to its limit when there are several', () => {
    renderCells(
      [
        component({}),
        component({ type: 'ram', name: 'RAM', measured_unit: 'GB' }),
        component({ type: 'disk', name: 'Disk' }),
      ],
      {
        limits: { cpu: 10, ram: 10, disk: 10 },
        limit_usage: { cpu: 1, ram: 9, disk: 5 },
      },
    );

    expect(screen.getByTestId('figures')).toHaveTextContent('RAM9/10 GB');
    expect(screen.getByRole('progressbar', { name: 'RAM' })).toHaveAttribute(
      'aria-valuenow',
      '90',
    );
  });

  it('shows dashes when the offering measures nothing', () => {
    renderCells([component({ billing_type: 'fixed' })], {});

    expect(screen.getByTestId('figures')).toHaveTextContent('—');
    expect(screen.getByTestId('bar')).toHaveTextContent('—');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the usage alone, not a full bar, when no limit is stored', () => {
    renderCells([component({})], { limit_usage: { cpu: 5 } });

    expect(screen.getByTestId('figures')).toHaveTextContent(/^5$/);
    expect(screen.getByTestId('bar')).toHaveTextContent('—');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the usage of a usage-billed component', () => {
    renderCells(
      [component({ type: 'gpu', name: 'GPU', billing_type: 'usage' })],
      { current_usages: { gpu: 7 } },
    );

    expect(screen.getByTestId('figures')).toHaveTextContent(/^7$/);
    expect(screen.getByTestId('bar')).toHaveTextContent('—');
  });
});

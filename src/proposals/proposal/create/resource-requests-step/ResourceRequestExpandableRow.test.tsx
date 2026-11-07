import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceRequestExpandableRow } from './ResourceRequestExpandableRow';

const request = (overrides = {}) =>
  ({
    uuid: 'request-1',
    limits: { cpu_hours: 40000 },
    attributes: { partition: 'general', backup: true },
    requested_offering: {
      provider_name: 'National Research Council',
      category_name: 'HPC Compute',
      components: [
        {
          type: 'cpu_hours',
          name: 'CPU Core Hours',
          measured_unit: 'hours',
          billing_type: 'limit',
        },
        {
          type: 'support',
          name: 'Priority support',
          measured_unit: 'hours',
          billing_type: 'limit',
        },
      ],
      options: {
        order: ['backup'],
        options: { backup: { label: 'Daily backup', type: 'boolean' } },
      },
    },
    ...overrides,
  }) as any;

describe('ResourceRequestExpandableRow', () => {
  it('lists where it runs, each amount and the option answers', () => {
    renderWithProviders(<ResourceRequestExpandableRow row={request()} />);

    expect(screen.getByText('National Research Council')).toBeInTheDocument();
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('Requested amounts')).toBeInTheDocument();
    expect(screen.getByText('40,000 hours')).toBeInTheDocument();
    expect(screen.getByText('Daily backup:')).toBeInTheDocument();
  });

  it('says a component nothing was asked for is not requested', () => {
    renderWithProviders(<ResourceRequestExpandableRow row={request()} />);

    expect(screen.getByText('Not requested')).toBeInTheDocument();
  });

  it('leaves out the amounts heading when the offering has none to ask for', () => {
    renderWithProviders(
      <ResourceRequestExpandableRow
        row={request({
          requested_offering: {
            ...request().requested_offering,
            components: [],
          },
        })}
      />,
    );

    expect(screen.queryByText('Requested amounts')).not.toBeInTheDocument();
  });
});

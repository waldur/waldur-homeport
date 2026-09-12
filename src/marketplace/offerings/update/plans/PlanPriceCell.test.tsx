import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlanPriceCell } from './PlanPriceCell';

const offering = (extra = {}) =>
  ({
    type: 'Marketplace.Basic',
    billable: true,
    components,
    ...extra,
  }) as any;

const components = [
  {
    type: 'cores',
    name: 'Cores',
    measured_unit: 'cores',
    billing_type: 'usage',
  },
  { type: 'ram', name: 'RAM', measured_unit: 'GB', billing_type: 'usage' },
] as any;

const plan = (props) =>
  ({
    uuid: 'plan-1',
    name: 'Pay as you go',
    prices: {},
    ...props,
  }) as any;

describe('PlanPriceCell', () => {
  it('prices a plan that charges nothing at zero, like any money column', () => {
    render(
      <PlanPriceCell
        plan={plan({ prices: { cores: '0.00', ram: '0.00' } })}
        offering={offering()}
      />,
    );

    expect(screen.getByText('€0.00')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('shows the price of the component the plan charges for', () => {
    const { container } = render(
      <PlanPriceCell
        plan={plan({ prices: { cores: '0.02', ram: '0.00' } })}
        offering={offering()}
      />,
    );

    expect(container.textContent).toContain('Cores');
    expect(container.textContent).toContain('0.02');
    expect(screen.queryByText('Free')).not.toBeInTheDocument();
  });

  it('prices in the units the plan bills rather than the offering ones', () => {
    const { container } = render(
      <PlanPriceCell
        plan={plan({
          prices: { cores: '0.02', ram: '0.01' },
          components: [
            {
              type: 'cores',
              billing_type: 'usage',
              measured_unit: 'core-hours',
            },
            { type: 'ram', billing_type: 'usage', measured_unit: 'GB-hours' },
          ],
        })}
        offering={offering()}
      />,
    );

    expect(container.textContent).toContain('core-hours');
    expect(container.textContent).not.toContain('components unpriced');
  });
});

describe('PlanPriceCell recurring charge', () => {
  const withFee = [
    {
      type: 'fee',
      name: 'Management fee',
      measured_unit: 'month',
      billing_type: 'fixed',
    },
    ...components,
  ] as any;

  it('leads with what the plan fixes itself, as a floor when the rest varies', () => {
    const { container } = render(
      <PlanPriceCell
        plan={plan({
          unit: 'month',
          quotas: { fee: 1 },
          prices: { fee: '200', cores: '0.02', ram: '0.01' },
        })}
        offering={offering({ components: withFee })}
      />,
    );

    expect(container.textContent).toContain('From');
    expect(container.textContent).toContain('200');
    expect(container.textContent).toContain('month');
  });

  it('quotes the figure plainly when nothing else can move it', () => {
    const { container } = render(
      <PlanPriceCell
        plan={plan({
          unit: 'month',
          quotas: { fee: 2 },
          prices: { fee: '100', cores: '0', ram: '0' },
        })}
        offering={offering({ components: [withFee[0]] })}
      />,
    );

    expect(container.textContent).toContain('200');
    expect(container.textContent).not.toContain('From');
  });
});

describe('PlanPriceCell free label', () => {
  // Stored prices cannot tell a plan priced at 0 on purpose from one nobody
  // priced, so the label states the fact and asks for nothing.
  it('labels an archived plan that charges nothing as free', () => {
    render(
      <PlanPriceCell
        plan={plan({ archived: true, prices: { cores: '0', ram: '0' } })}
        offering={offering()}
      />,
    );

    expect(screen.getByText('€0.00')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('labels a plan of an offering nothing is invoiced for as free', () => {
    render(
      <PlanPriceCell
        plan={plan({ prices: { cores: '0', ram: '0' } })}
        offering={offering({ billable: false })}
      />,
    );

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('does not ask the provider to price anything', () => {
    render(
      <PlanPriceCell
        plan={plan({ prices: { cores: '0', ram: '0' } })}
        offering={offering()}
      />,
    );

    expect(screen.queryByText('Needs pricing')).not.toBeInTheDocument();
  });
});

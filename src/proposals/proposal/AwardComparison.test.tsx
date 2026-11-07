import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { compareAward } from '@/proposals/awardedResources';
import { renderWithProviders } from '@/test/harness';

import {
  AwardChangeBadge,
  AwardDetails,
  AwardOfferingCell,
} from './AwardComparison';

describe('AwardChangeBadge', () => {
  it('shows nothing for an item awarded as requested', () => {
    const { container } = renderWithProviders(
      <AwardChangeBadge change="unchanged" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('names how the award differs from the request', () => {
    renderWithProviders(<AwardChangeBadge change="changed" />);
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });
});

describe('AwardDetails', () => {
  const offering = {
    uuid: 'offering-1',
    offering_name: 'HPC',
    plan_details: null,
  } as any;
  const awarded = (overrides = {}) =>
    ({
      uuid: 'award-1',
      requested_offering: offering,
      plan_name: null,
      created_by_name: null,
      modified_by_name: null,
      ...overrides,
    }) as any;
  const requested = { uuid: 'request-1', requested_offering: offering } as any;

  it('names who last changed an item', () => {
    renderWithProviders(
      <AwardDetails
        row={{
          uuid: 'award-1',
          requested,
          awarded: awarded({
            created_by_name: 'Ann Applicant',
            modified_by_name: 'Carl Manager',
          }),
          change: 'changed',
        }}
      />,
    );
    expect(screen.getByTestId('award-author')).toHaveTextContent(
      'Changed by Carl Manager',
    );
  });

  it('names who added an item nobody requested', () => {
    renderWithProviders(
      <AwardDetails
        row={{
          uuid: 'award-1',
          awarded: awarded({ created_by_name: 'Carl Manager' }),
          change: 'added',
        }}
      />,
    );
    expect(screen.getByTestId('award-author')).toHaveTextContent(
      'Added by Carl Manager',
    );
  });

  it('names nobody for an item copied from the request and left alone', () => {
    renderWithProviders(
      <AwardDetails
        row={{
          uuid: 'award-1',
          requested,
          awarded: awarded({ created_by_name: 'Carl Manager' }),
          change: 'unchanged',
        }}
      />,
    );
    expect(screen.queryByTestId('award-author')).not.toBeInTheDocument();
  });
});

const optionsOffering = {
  uuid: 'call-offering-hpc',
  offering_name: 'HPC',
  plan_details: { uuid: 'plan-standard', name: 'Standard' },
  components: [{ type: 'cpu_hours', billing_type: 'limit' }],
  options: {
    order: ['qos'],
    options: {
      qos: { type: 'select_string', label: 'QoS', required: true },
    },
  },
};

const rowWith = (awardedQos?: string) =>
  compareAward(
    [
      {
        uuid: 'r1',
        requested_offering: optionsOffering,
        limits: { cpu_hours: 1000 },
        attributes: { qos: 'parallel' },
      } as any,
    ],
    [
      {
        uuid: 'a1',
        requested_resource: 'r1',
        requested_offering: optionsOffering,
        limits: { cpu_hours: 1000 },
        attributes: awardedQos ? { qos: awardedQos } : {},
        plan: 'plan-standard',
      } as any,
    ],
  )[0];

describe('AwardDetails options', () => {
  // waldur/waldur-homeport#129 on GitHub: the call manager changed the QoS
  // and the table still read "As requested", without the QoS at all.
  it('shows the awarded option with what was requested', () => {
    renderWithProviders(<AwardDetails row={rowWith('balanced')} />);
    expect(
      screen.getByText('balanced (requested parallel)'),
    ).toBeInTheDocument();
    renderWithProviders(<AwardOfferingCell row={rowWith('balanced')} />);
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });

  // The backend refuses such an award, so the manager editing it is told why.
  it('names a required option the award leaves empty where it is edited', () => {
    renderWithProviders(<AwardDetails row={rowWith()} showMissingOptions />);
    expect(screen.getByText('Missing: QoS')).toBeInTheDocument();
  });

  // An applicant or reviewer reading the award cannot answer it.
  it('keeps the hint out of a read-only award', () => {
    renderWithProviders(<AwardDetails row={rowWith()} />);
    expect(screen.queryByText(/Missing:/)).not.toBeInTheDocument();
  });

  it('says nothing is missing once the option is awarded', () => {
    renderWithProviders(
      <AwardDetails row={rowWith('parallel')} showMissingOptions />,
    );
    expect(screen.queryByText(/Missing:/)).not.toBeInTheDocument();
    expect(screen.getByText('parallel')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { compareAward } from '@/proposals/awardedResources';

import { AwardOfferingCell } from './AwardComparison';

const offering = {
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
        requested_offering: offering,
        limits: { cpu_hours: 1000 },
        attributes: { qos: 'parallel' },
      } as any,
    ],
    [
      {
        uuid: 'a1',
        requested_resource: 'r1',
        requested_offering: offering,
        limits: { cpu_hours: 1000 },
        attributes: awardedQos ? { qos: awardedQos } : {},
        plan: 'plan-standard',
      } as any,
    ],
  )[0];

describe('AwardOfferingCell', () => {
  // waldur/waldur-homeport#129 on GitHub: the call manager changed the QoS
  // and the table still read "As requested", without the QoS at all.
  it('shows the awarded option with what was requested', () => {
    render(<AwardOfferingCell row={rowWith('balanced')} />);
    expect(
      screen.getByText('QoS: balanced (requested parallel)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });

  // The backend refuses such an award, so the manager editing it is told why.
  it('names a required option the award leaves empty where it is edited', () => {
    render(<AwardOfferingCell row={rowWith()} showMissingOptions />);
    expect(screen.getByText('Missing: QoS')).toBeInTheDocument();
  });

  // An applicant or reviewer reading the award cannot answer it.
  it('keeps the hint out of a read-only award', () => {
    render(<AwardOfferingCell row={rowWith()} />);
    expect(screen.queryByText(/Missing:/)).not.toBeInTheDocument();
  });

  it('says nothing is missing once the option is awarded', () => {
    render(<AwardOfferingCell row={rowWith('parallel')} showMissingOptions />);
    expect(screen.queryByText(/Missing:/)).not.toBeInTheDocument();
    expect(screen.getByText('QoS: parallel')).toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsOfferingsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { Step1General } from './Step1General';

const offering = {
  uuid: 'requested-offering-1',
  url: 'https://api/requested-offerings/1/',
  offering_name: 'SLURM HPC Allocation',
  plan_details: { name: 'SLURM Grant Allocation' },
};

describe('Step1General', () => {
  // Regression: editing a template cleared its offering while the call's
  // offerings were loading, and picking it again reset the template's limits.
  it("keeps an edited template's offering and limits while offerings load", async () => {
    let finishLoading: (value: any) => void;
    vi.mocked(proposalProtectedCallsOfferingsList).mockReturnValue(
      new Promise((resolve) => {
        finishLoading = resolve;
      }) as any,
    );
    let values: any;
    renderWithProviders(
      <Form
        onSubmit={() => undefined}
        initialValues={{
          name: 'Basic tier',
          offering: {
            uuid: offering.uuid,
            url: offering.url,
            offering_name: offering.offering_name,
          },
          limits: { cpu: 5000 },
        }}
        render={({ values: current }) => {
          values = current;
          return (
            <Step1General
              title="General information"
              step={0}
              steps={[]}
              onPrev={vi.fn()}
              onStep={vi.fn()}
              data={{ call: { uuid: 'call-1' } }}
            />
          );
        }}
      />,
    );

    await waitFor(() =>
      expect(proposalProtectedCallsOfferingsList).toHaveBeenCalled(),
    );
    expect(values.offering?.uuid).toBe(offering.uuid);

    finishLoading(mockListResponse([offering]));

    expect(await screen.findByText('SLURM HPC Allocation')).toBeInTheDocument();
    expect(values.offering?.uuid).toBe(offering.uuid);
    expect(values.limits).toEqual({ cpu: 5000 });
  });
});

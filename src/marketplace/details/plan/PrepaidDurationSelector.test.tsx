import { waitFor } from '@testing-library/react';
import { Form, FormSpy } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { PrepaidMonthsModeProvider } from './prepaidDurationMode';
import { PrepaidDurationSelector } from './PrepaidDurationSelector';

const constraints = {
  min_prepaid_duration: 1,
  max_prepaid_duration: 12,
  prepaid_duration_step: 1,
};

const renderSelector = (mode, attributes = {}) => {
  let values: any;
  renderWithProviders(
    <Form onSubmit={vi.fn()} initialValues={{ attributes }}>
      {() => (
        <>
          <PrepaidMonthsModeProvider value={mode}>
            <PrepaidDurationSelector
              constraints={constraints}
              components={[{ type: 'storage' } as any]}
            />
          </PrepaidMonthsModeProvider>
          <FormSpy subscription={{ values: true }}>
            {(state) => {
              values = state.values;
              return null;
            }}
          </FormSpy>
        </>
      )}
    </Form>,
  );
  return () => values;
};

describe('PrepaidDurationSelector in months mode', () => {
  it('seeds a length and an end date for a new request', async () => {
    const values = renderSelector({
      name: 'attributes.prepaid_duration_months',
    });
    await waitFor(() =>
      expect(values().attributes.prepaid_duration_months).toBe(1),
    );
    expect(values().attributes.end_date).toBeTruthy();
  });

  // Saving an award item untouched gave it a one-month subscription it never
  // had, and an end date counted from the day of the edit.
  it('leaves a record without a period alone when keeping what is stored', async () => {
    const values = renderSelector(
      { name: 'attributes.prepaid_duration_months', keepStored: true },
      {},
    );
    // Give the effects a chance to run.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(values().attributes).toEqual({});
  });

  it('keeps a stored length without deriving an end date from today', async () => {
    const values = renderSelector(
      { name: 'attributes.prepaid_duration_months', keepStored: true },
      { prepaid_duration_months: 6 },
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(values().attributes).toEqual({ prepaid_duration_months: 6 });
  });
});

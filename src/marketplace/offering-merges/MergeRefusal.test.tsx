import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { getMergeRefusal, MergeRefusalAlert } from './MergeRefusal';

describe('getMergeRefusal', () => {
  it('reads the body the SDK throws', () => {
    expect(
      getMergeRefusal({
        detail: 'Refused.',
        missing_acknowledgements: ['plan_price_difference'],
      }),
    ).toEqual({
      detail: 'Refused.',
      blockers: [],
      missing_acknowledgements: ['plan_price_difference'],
    });
  });

  it('reads an axios-style response body', () => {
    expect(
      getMergeRefusal({ response: { data: { detail: 'Not done.' } } }),
    ).toEqual({
      detail: 'Not done.',
      blockers: [],
      missing_acknowledgements: [],
    });
  });

  it('ignores errors that carry no refusal', () => {
    expect(getMergeRefusal(new Error('network'))).toBeNull();
    expect(getMergeRefusal(undefined)).toBeNull();
  });
});

describe('MergeRefusalAlert', () => {
  it('lists blockers and missing acknowledgements', () => {
    renderWithProviders(
      <MergeRefusalAlert
        title="Refused"
        refusal={{
          detail: 'The merge cannot run.',
          blockers: [
            {
              code: 'pending_orders',
              message: '2 orders pending.',
              details: {},
            },
          ],
          missing_acknowledgements: ['offering_user_on_both'],
        }}
      />,
    );
    expect(screen.getByText('The merge cannot run.')).toBeInTheDocument();
    expect(screen.getByText(/2 orders pending/)).toBeInTheDocument();
    expect(screen.getByText('offering_user_on_both')).toBeInTheDocument();
  });

  it('renders nothing without a refusal', () => {
    renderWithProviders(<MergeRefusalAlert title="Refused" refusal={null} />);
    expect(screen.queryByTestId('merge-refusal')).toBeNull();
  });
});

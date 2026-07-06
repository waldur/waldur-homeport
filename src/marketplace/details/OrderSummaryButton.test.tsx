import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { OrderSummaryButton } from './OrderSummaryButton';

const offering = { uuid: 'offering-uuid', type: 'Test.Offering' } as any;

// `@/modal/actions` is mocked globally (see test/mocks/modal); grab the shared
// openDialog spy from the mocked hook.
const { openDialog } = useModal();

describe('OrderSummaryButton', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.mocked(openDialog).mockClear();
  });

  const renderButton = (initialValues) =>
    renderWithProviders(
      <Form
        onSubmit={vi.fn()}
        initialValues={initialValues}
        render={() => <OrderSummaryButton offering={offering} />}
      />,
    );

  it('opens the summary dialog with a snapshot of the current form values', async () => {
    const initialValues = {
      customer: { uuid: 'customer-uuid', name: 'Acme' },
      plan: { uuid: 'plan-uuid' },
      limits: { cores: 4 },
    };
    renderButton(initialValues);

    await user.click(screen.getByRole('button', { name: /View summary/i }));

    expect(openDialog).toHaveBeenCalledTimes(1);
    const [, props] = vi.mocked(openDialog).mock.calls[0];
    expect(props).toEqual(
      expect.objectContaining({
        offering,
        size: 'sm',
        formValues: initialValues,
      }),
    );
  });

  it('does not open the dialog until the button is clicked', () => {
    renderButton({ customer: { uuid: 'customer-uuid' } });
    expect(openDialog).not.toHaveBeenCalled();
  });
});

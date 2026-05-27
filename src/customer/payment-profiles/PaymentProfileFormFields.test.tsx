import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { PaymentProfileFormFields } from './PaymentProfileFormFields';

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

describe('PaymentProfileFormFields', () => {
  const options = [
    { label: 'Fixed-price', value: 'fixed_price' },
    { label: 'Invoices', value: 'invoices' },
  ];

  it('renders basic fields', () => {
    render(
      <Form
        onSubmit={vi.fn()}
        render={() => (
          <PaymentProfileFormFields paymentProfileTypeOptions={options} />
        )}
      />,
    );

    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
  });

  it('renders additional fields for fixed_price', () => {
    render(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ payment_type: options[0] }}
        render={() => (
          <PaymentProfileFormFields paymentProfileTypeOptions={options} />
        )}
      />,
    );

    expect(screen.getByText(/End date/i)).toBeInTheDocument();
    expect(screen.getByText(/Agreement number/i)).toBeInTheDocument();
    expect(screen.getByText(/Contract sum/i)).toBeInTheDocument();
  });

  it('hides additional fields for invoices', () => {
    render(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ payment_type: options[1] }}
        render={() => (
          <PaymentProfileFormFields paymentProfileTypeOptions={options} />
        )}
      />,
    );

    expect(screen.queryByText(/End date/i)).not.toBeInTheDocument();
  });
});

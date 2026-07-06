import { render, screen } from '@testing-library/react';
import { useFormState } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCheckoutSummaryComponent } from '../common/registry';

import { OrderSummaryDialog } from './OrderSummaryDialog';

vi.mock('../common/registry', () => ({
  getCheckoutSummaryComponent: vi.fn(),
}));

// Probe reproducing how the real summary reads the deploy form via
// useFormState (see marketplace/deploy/selectors.ts). It throws the same
// "useFormState must be used inside of a <Form>" error if the dialog fails
// to provide a form context.
const SummaryProbe = () => {
  const { values } = useFormState();
  return <div>Customer: {(values as any).customer?.name}</div>;
};

const offering = { uuid: 'offering-uuid', type: 'Test.Offering' } as any;

// The dialog is rendered inside a modal portal, outside the deploy form's
// <Form> provider — so these tests intentionally render it WITHOUT a wrapping
// <Form>, exactly as the modal root does.
describe('OrderSummaryDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCheckoutSummaryComponent).mockReturnValue(SummaryProbe as any);
  });

  it('provides a form context seeded with the snapshotted values', () => {
    expect(() =>
      render(
        <OrderSummaryDialog
          offering={offering}
          formValues={{ customer: { name: 'Acme' } } as any}
        />,
      ),
    ).not.toThrow();

    expect(screen.getByText('Customer: Acme')).toBeInTheDocument();
  });

  it('renders without throwing when no form values were captured', () => {
    expect(() =>
      render(<OrderSummaryDialog offering={offering} />),
    ).not.toThrow();

    expect(screen.getByText(/Summary/)).toBeInTheDocument();
  });
});

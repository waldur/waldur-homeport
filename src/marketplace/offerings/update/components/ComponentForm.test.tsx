import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ComponentForm } from './ComponentForm';

const renderComponent = (props: any = {}, initialValues = {}) => {
  return render(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ComponentForm {...props} />
        </form>
      )}
    />,
  );
};

describe('ComponentForm', () => {
  const user = userEvent.setup();
  const mockOffering = { uuid: 'offering-uuid' } as any;

  it('renders all fields', () => {
    renderComponent({ offering: mockOffering });
    expect(screen.getByLabelText(/Internal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Measured unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Accounting type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Article code/i)).toBeInTheDocument();
  });

  it('validates measured unit length', async () => {
    renderComponent({ offering: mockOffering });
    const input = screen.getByLabelText(/Measured unit/i);

    // Type 31 characters
    await user.type(input, 'a'.repeat(31));
    await user.tab();

    expect(
      screen.getByText(/Ensure this field has no more than 30 characters./i),
    ).toBeInTheDocument();
  });

  it('renders measured unit as disabled when readOnly is true', () => {
    renderComponent({ offering: mockOffering, readOnly: true });
    expect(screen.getByLabelText(/Measured unit/i)).toBeDisabled();
  });

  it('auto-fills the internal name from the display name', async () => {
    renderComponent({ offering: mockOffering });
    await user.type(screen.getByLabelText(/Display name/i), 'CPU hours');
    const internalNameInput = screen.getByLabelText(
      /Internal name/i,
    ) as HTMLInputElement;
    expect(internalNameInput.value).toBe('cpu_hours');
  });
});

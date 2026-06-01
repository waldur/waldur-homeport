import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { InternalNameField } from './InternalNameField';

const renderComponent = (props: any = {}, initialValues = {}) => {
  return render(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <InternalNameField name="type" {...props} />
        </form>
      )}
    />,
  );
};

describe('InternalNameField', () => {
  const user = userEvent.setup();

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/Internal name/i)).toBeInTheDocument();
  });

  it('validates required field', async () => {
    renderComponent();
    const input = screen.getByLabelText(/Internal name/i);

    await user.click(input);
    await user.tab();

    expect(screen.getByText(/This field is required./i)).toBeInTheDocument();
  });

  it('validates internal name pattern', async () => {
    renderComponent();
    const input = screen.getByLabelText(/Internal name/i);

    await user.type(input, 'Invalid Name!');
    await user.tab();

    expect(
      screen.getByText(
        /Please use Latin letters, numbers, underscores, hyphens, slashes, and colons only./i,
      ),
    ).toBeInTheDocument();
  });

  it('allows valid internal name', async () => {
    renderComponent();
    const input = screen.getByLabelText(/Internal name/i);

    await user.type(input, 'valid_name-1/2:3');
    await user.tab();

    expect(
      screen.queryByText(/Please use Latin letters/i),
    ).not.toBeInTheDocument();
  });

  it('parses input correctly (removes dots)', async () => {
    renderComponent();
    const input = screen.getByLabelText(/Internal name/i);

    await user.type(input, 'name.with.dots');

    expect(input).toHaveValue('namewithdots');
  });

  it('renders disabled state', () => {
    renderComponent({ disabled: true });
    expect(screen.getByLabelText(/Internal name/i)).toBeDisabled();
  });

  it('renders readOnly state', () => {
    renderComponent({ readOnly: true });
    expect(screen.getByLabelText(/Internal name/i)).toHaveAttribute('readonly');
  });
});

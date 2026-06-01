import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { vi, describe, it, expect } from 'vitest';

import { StaticRoutesTable } from './StaticRoutesTable';

const renderTable = (initialRoutes: any[] = [], fixedIps: any[] = []) => {
  let formValues;
  const onSubmit = vi.fn((values) => {
    formValues = values;
  });

  const { container } = render(
    <Form
      onSubmit={onSubmit}
      initialValues={{ routes: initialRoutes }}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit} data-testid="form">
          <FieldArray
            name="routes"
            render={({ fields }) => (
              <StaticRoutesTable fields={fields} fixedIps={fixedIps} />
            )}
          />
          <button type="submit" disabled={invalid}>
            Submit
          </button>
        </form>
      )}
    />,
  );

  return { onSubmit, formValues, container };
};

describe('StaticRoutesTable', () => {
  it('renders correctly with empty routes', () => {
    renderTable();
    expect(
      screen.getByRole('button', { name: 'Add route' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders correctly with existing routes', () => {
    const initialRoutes = [
      { destination: '10.0.0.0/24', nexthop: '192.168.1.1' },
    ];
    renderTable(initialRoutes);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10.0.0.0/24')).toBeInTheDocument();
    expect(screen.getByDisplayValue('192.168.1.1')).toBeInTheDocument();
  });

  it('adds a new route', async () => {
    const user = userEvent.setup();
    renderTable();
    const addButton = screen.getByRole('button', {
      name: 'Add route',
    });
    await user.click(addButton);

    expect(screen.getByRole('table')).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(2); // destination and nexthop
  });

  it('removes a route', async () => {
    const user = userEvent.setup();
    const initialRoutes = [
      { destination: '10.0.0.0/24', nexthop: '192.168.1.1' },
    ];
    renderTable(initialRoutes);

    const removeButton = screen.getByRole('button', {
      name: 'Remove',
    });
    await user.click(removeButton);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('validates duplicate IP address against fixedIps', async () => {
    const user = userEvent.setup();
    const fixedIps: any[] = [{ ip_address: '192.168.1.1' }];
    renderTable([], fixedIps);

    // Add a route
    await user.click(screen.getByRole('button', { name: 'Add route' }));

    // Get inputs
    const inputs = screen.getAllByRole('textbox');
    const destinationInput = inputs[0];
    const nexthopInput = inputs[1];

    // Fill destination (required)
    await user.type(destinationInput, '10.0.0.0/24');

    // Enter a duplicate IP
    await user.type(nexthopInput, '192.168.1.1');
    await user.tab();

    // Submit button should be disabled
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();

    // Error message should be rendered
    expect(
      screen.getByText('IP address is already used by router.'),
    ).toBeInTheDocument();

    // Enter a unique IP
    await user.clear(nexthopInput);
    await user.type(nexthopInput, '192.168.1.2');

    // Submit button should be enabled
    expect(submitButton).not.toBeDisabled();

    // Error message should be gone
    expect(
      screen.queryByText('IP address is already used by router.'),
    ).not.toBeInTheDocument();
  });
});

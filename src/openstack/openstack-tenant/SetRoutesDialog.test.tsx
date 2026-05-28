import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenStackRouter, openstackRoutersSetRoutes } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SetRoutesDialog } from './SetRoutesDialog';

// Mock dependencies

vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ title, children, footer }: any) => (
    <div data-testid="modal-dialog">
      <h1>{title}</h1>
      <div data-testid="modal-body">{children}</div>
      <div data-testid="modal-footer">{footer}</div>
    </div>
  ),
}));

vi.mock('@/form', () => ({
  FormFooter: ({ submitLabel, submitting, invalid }: any) => (
    <button type="submit" disabled={submitting || invalid}>
      {submitLabel}
    </button>
  ),
  StringField: ({ input }: any) => <input {...input} />,
  FieldError: ({ error }: any) => (error ? <span>{error}</span> : null),
}));

const mockRouter = {
  uuid: 'router-uuid-123',
  fixed_ips: [],
  routes: [{ destination: '10.0.0.0/24', nexthop: '192.168.1.1' }],
} as unknown as OpenStackRouter;

describe('SetRoutesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial routes', () => {
    renderWithProviders(<SetRoutesDialog resolve={{ router: mockRouter }} />);

    expect(screen.getByText('Update static routes')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10.0.0.0/24')).toBeInTheDocument();
    expect(screen.getByDisplayValue('192.168.1.1')).toBeInTheDocument();
  });

  it('submits the form with modified routes', async () => {
    renderWithProviders(<SetRoutesDialog resolve={{ router: mockRouter }} />);

    // Add a new route
    const addButton = screen.getByRole('button', {
      name: 'Add route',
    });
    fireEvent.click(addButton);

    // Fill the new route fields
    const inputs = screen.getAllByRole('textbox');
    // inputs[0], inputs[1] are existing route. inputs[2], inputs[3] are new route.
    fireEvent.change(inputs[2], { target: { value: '192.168.2.0/24' } });
    fireEvent.change(inputs[3], { target: { value: '10.0.0.1' } });

    // Submit
    const submitButton = screen.getByText('Update');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(openstackRoutersSetRoutes).toHaveBeenCalledTimes(1);
    });

    expect(openstackRoutersSetRoutes).toHaveBeenCalledWith({
      path: { uuid: 'router-uuid-123' },
      body: {
        routes: [
          { destination: '10.0.0.0/24', nexthop: '192.168.1.1' },
          { destination: '192.168.2.0/24', nexthop: '10.0.0.1' },
        ],
      },
    });
  });

  it('submits the form after removing a route', async () => {
    renderWithProviders(<SetRoutesDialog resolve={{ router: mockRouter }} />);

    const removeButton = screen.getByRole('button', {
      name: 'Remove',
    });
    fireEvent.click(removeButton);

    const submitButton = screen.getByText('Update');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(openstackRoutersSetRoutes).toHaveBeenCalledTimes(1);
    });

    expect(openstackRoutersSetRoutes).toHaveBeenCalledWith({
      path: { uuid: 'router-uuid-123' },
      body: {
        routes: [],
      },
    });
  });
});

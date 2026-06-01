import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenStackRouter, openstackRoutersSetRoutes } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SetRoutesDialog } from './SetRoutesDialog';

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
    const user = userEvent.setup();
    renderWithProviders(<SetRoutesDialog resolve={{ router: mockRouter }} />);

    // Add a new route
    const addButton = screen.getByRole('button', {
      name: 'Add route',
    });
    await user.click(addButton);

    // Fill the new route fields
    const inputs = screen.getAllByRole('textbox');
    // inputs[0], inputs[1] are existing route. inputs[2], inputs[3] are new route.
    await user.type(inputs[2], '192.168.2.0/24');
    await user.type(inputs[3], '10.0.0.1');

    // Submit
    const submitButton = screen.getByText('Update');
    await user.click(submitButton);

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
    const user = userEvent.setup();
    renderWithProviders(<SetRoutesDialog resolve={{ router: mockRouter }} />);

    const removeButton = screen.getByRole('button', {
      name: 'Remove',
    });
    await user.click(removeButton);

    const submitButton = screen.getByText('Update');
    await user.click(submitButton);

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

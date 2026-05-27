import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  getDefaultAllocationPool,
  validateAllocationPool,
} from '../openstack-network/utils';

import { InternalNetworkAllocationPool } from './AllocationPoolsField';

vi.mock('../openstack-network/utils', () => ({
  getDefaultAllocationPool: vi.fn(),
  validateAllocationPool: vi.fn(),
}));

const renderComponent = (initialValues = {}) => {
  return render(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <InternalNetworkAllocationPool />
        </form>
      )}
    />,
  );
};

describe('AllocationPoolsField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderComponent();
    expect(
      screen.getByText('Internal network allocation pool'),
    ).toBeInTheDocument();
    expect(screen.getByText('Add allocation pool')).toBeInTheDocument();
  });

  it('initializes default pool when CIDR is provided', async () => {
    const mockDefaultPool = { start: '192.168.1.2', end: '192.168.1.254' };
    vi.mocked(getDefaultAllocationPool).mockReturnValue(mockDefaultPool);

    renderComponent({ cidr: '192.168.1.0/24' });

    await waitFor(() => {
      expect(getDefaultAllocationPool).toHaveBeenCalledWith('192.168.1.0/24');
      expect(screen.getAllByDisplayValue('192.168.1.2').length).toBeGreaterThan(
        0,
      );
    });
  });

  it('adds a new pool when button is clicked', async () => {
    const user = userEvent.setup();
    const mockDefaultPool = { start: '192.168.1.2', end: '192.168.1.254' };
    vi.mocked(getDefaultAllocationPool).mockReturnValue(mockDefaultPool);

    renderComponent({ cidr: '192.168.1.0/24' });

    // Wait for initial pool
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Start IP').length).toBeGreaterThan(
        0,
      );
    });

    const initialCount = screen.getAllByPlaceholderText('Start IP').length;

    const addButton = screen.getByText('Add allocation pool');
    await user.click(addButton);

    expect(screen.getAllByPlaceholderText('Start IP')).toHaveLength(
      initialCount + 1,
    );
  });

  it('removes a pool when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockDefaultPool = { start: '192.168.1.2', end: '192.168.1.254' };
    vi.mocked(getDefaultAllocationPool).mockReturnValue(mockDefaultPool);

    // Initial with two pools
    const { container } = renderComponent({
      cidr: '192.168.1.0/24',
      allocation_pools: [
        { start: '192.168.1.2', end: '192.168.1.10' },
        { start: '192.168.1.20', end: '192.168.1.30' },
      ],
    });

    const removeButtons = container.querySelectorAll('.btn-danger');
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0]);

    expect(container.querySelectorAll('.btn-danger')).toHaveLength(1);
  });

  it('updates pools when CIDR changes', async () => {
    const mockDefaultPool1 = { start: '192.168.1.2', end: '192.168.1.254' };
    const mockDefaultPool2 = { start: '10.0.0.2', end: '10.0.0.254' };
    vi.mocked(getDefaultAllocationPool)
      .mockReturnValueOnce(mockDefaultPool1)
      .mockReturnValue(mockDefaultPool2);

    const { rerender } = render(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ cidr: '192.168.1.0/24' }}
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <InternalNetworkAllocationPool />
          </form>
        )}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('192.168.1.2').length).toBeGreaterThan(
        0,
      );
    });

    rerender(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ cidr: '10.0.0.0/24' }}
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <InternalNetworkAllocationPool />
          </form>
        )}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('10.0.0.2').length).toBeGreaterThan(0);
    });
  });

  it('shows validation error', async () => {
    const user = userEvent.setup();
    const mockDefaultPool = { start: '192.168.1.2', end: '192.168.1.254' };
    vi.mocked(getDefaultAllocationPool).mockReturnValue(mockDefaultPool);
    vi.mocked(validateAllocationPool).mockReturnValue({
      error: 'Invalid range',
      field: 'end',
    });

    renderComponent({ cidr: '192.168.1.0/24' });

    // Wait for initial pool
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
        0,
      );
    });

    const endInputs = screen.getAllByPlaceholderText('End IP');
    await user.type(endInputs[0], '1'); // Trigger change

    await waitFor(() => {
      expect(screen.getByText('Invalid range')).toBeInTheDocument();
    });
  });
});

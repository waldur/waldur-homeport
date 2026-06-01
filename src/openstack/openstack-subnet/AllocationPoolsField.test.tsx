import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { InternalNetworkAllocationPool } from './AllocationPoolsField';

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

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    renderComponent();
    expect(
      screen.getByText('Internal network allocation pool'),
    ).toBeInTheDocument();
    expect(screen.getByText('Add allocation pool')).toBeInTheDocument();
  });

  it('initializes default pool when CIDR is provided', async () => {
    renderComponent({ cidr: '192.168.1.0/24' });

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('192.168.1.2').length).toBeGreaterThan(
        0,
      );
      expect(
        screen.getAllByDisplayValue('192.168.1.254').length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows placeholder text when no pools are present and CIDR is not provided', () => {
    renderComponent({ cidr: '' });

    expect(
      screen.getByText(
        'No allocation pools defined. Default pool will be used.',
      ),
    ).toBeInTheDocument();
  });

  it('adds a new pool when button is clicked', async () => {
    const user = userEvent.setup();

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

  it('adds an empty pool when Add button is clicked but CIDR is not provided', async () => {
    const user = userEvent.setup();

    renderComponent({ cidr: '' });

    const addButton = screen.getByText('Add allocation pool');
    await user.click(addButton);

    expect(screen.getAllByPlaceholderText('Start IP')).toHaveLength(1);
    expect(screen.getAllByPlaceholderText('Start IP')[0]).toHaveValue('');
    expect(screen.getAllByPlaceholderText('End IP')[0]).toHaveValue('');
  });

  it('removes a pool when remove button is clicked', async () => {
    const user = userEvent.setup();

    // Initial with two pools
    renderComponent({
      cidr: '192.168.1.0/24',
      allocation_pools: [
        { start: '192.168.1.2', end: '192.168.1.10' },
        { start: '192.168.1.20', end: '192.168.1.30' },
      ],
    });

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0]);

    expect(screen.getAllByRole('button', { name: /Remove/i })).toHaveLength(1);
  });

  it('clears validation error when the pool with error is removed', async () => {
    const user = userEvent.setup();

    renderComponent({ cidr: '192.168.1.0/24' });

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
        0,
      );
    });

    const endInputs = screen.getAllByPlaceholderText('End IP');
    await user.clear(endInputs[0]);
    await user.type(endInputs[0], '192.168.1.1');

    await waitFor(() => {
      expect(
        screen.getByText('End IP must be greater than or equal to Start IP'),
      ).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /Remove/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(
        screen.queryByText('End IP must be greater than or equal to Start IP'),
      ).not.toBeInTheDocument();
    });
  });

  it('updates pools when CIDR changes', async () => {
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

  it('clears validation errors when CIDR changes', async () => {
    const user = userEvent.setup();

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
      expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
        0,
      );
    });

    const endInputs = screen.getAllByPlaceholderText('End IP');
    await user.clear(endInputs[0]);
    await user.type(endInputs[0], '192.168.1.1');

    await waitFor(() => {
      expect(
        screen.getByText('End IP must be greater than or equal to Start IP'),
      ).toBeInTheDocument();
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
      expect(
        screen.queryByText('End IP must be greater than or equal to Start IP'),
      ).not.toBeInTheDocument();
    });
  });

  describe('validation errors', () => {
    it('shows validation error for invalid start IP format', async () => {
      const user = userEvent.setup();

      renderComponent({ cidr: '192.168.1.0/24' });

      await waitFor(() => {
        expect(
          screen.getAllByPlaceholderText('Start IP').length,
        ).toBeGreaterThan(0);
      });

      const startInputs = screen.getAllByPlaceholderText('Start IP');
      await user.clear(startInputs[0]);
      await user.type(startInputs[0], 'invalid_ip');

      await waitFor(() => {
        expect(
          screen.getByText('Start IP is not a valid IPv4 address'),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid end IP format', async () => {
      const user = userEvent.setup();

      renderComponent({ cidr: '192.168.1.0/24' });

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
          0,
        );
      });

      const endInputs = screen.getAllByPlaceholderText('End IP');
      await user.clear(endInputs[0]);
      await user.type(endInputs[0], 'invalid_ip');

      await waitFor(() => {
        expect(
          screen.getByText('End IP is not a valid IPv4 address'),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when end IP is less than start IP', async () => {
      const user = userEvent.setup();

      renderComponent({ cidr: '192.168.1.0/24' });

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
          0,
        );
      });

      const endInputs = screen.getAllByPlaceholderText('End IP');
      await user.clear(endInputs[0]);
      await user.type(endInputs[0], '192.168.1.1');

      await waitFor(() => {
        expect(
          screen.getByText('End IP must be greater than or equal to Start IP'),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when start IP is outside CIDR range', async () => {
      const user = userEvent.setup();

      renderComponent({ cidr: '192.168.1.0/24' });

      await waitFor(() => {
        expect(
          screen.getAllByPlaceholderText('Start IP').length,
        ).toBeGreaterThan(0);
      });

      const startInputs = screen.getAllByPlaceholderText('Start IP');
      await user.clear(startInputs[0]);
      await user.type(startInputs[0], '10.0.0.1');

      await waitFor(() => {
        expect(
          screen.getByText('Start IP is not within the CIDR range'),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when end IP is outside CIDR range', async () => {
      const user = userEvent.setup();

      renderComponent({ cidr: '192.168.1.0/24' });

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
          0,
        );
      });

      const endInputs = screen.getAllByPlaceholderText('End IP');
      await user.clear(endInputs[0]);
      await user.type(endInputs[0], '192.168.2.1');

      await waitFor(() => {
        expect(
          screen.getByText('End IP is not within the CIDR range'),
        ).toBeInTheDocument();
      });
    });

    it('clears validation error when the input becomes valid', async () => {
      const user = userEvent.setup();

      renderComponent({ cidr: '192.168.1.0/24' });

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('End IP').length).toBeGreaterThan(
          0,
        );
      });

      const endInputs = screen.getAllByPlaceholderText('End IP');
      await user.clear(endInputs[0]);
      await user.type(endInputs[0], '192.168.1.1');

      await waitFor(() => {
        expect(
          screen.getByText('End IP must be greater than or equal to Start IP'),
        ).toBeInTheDocument();
      });

      await user.clear(endInputs[0]);
      await user.type(endInputs[0], '192.168.1.100');

      await waitFor(() => {
        expect(
          screen.queryByText(
            'End IP must be greater than or equal to Start IP',
          ),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission errors', () => {
    it('shows form meta error when submit fails', async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <Form
          onSubmit={() => {}}
          initialValues={{ cidr: '192.168.1.0/24' }}
          mutators={{ ...arrayMutators }}
          validate={() => ({
            allocation_pools: 'Global array validation error',
          })}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <InternalNetworkAllocationPool />
              <button type="submit">Submit Form</button>
            </form>
          )}
        />,
      );

      const btn = screen.getByRole('button', { name: 'Submit Form' });
      await user.click(btn);

      await waitFor(() => {
        expect(
          screen.getByText('Global array validation error'),
        ).toBeInTheDocument();
      });
      unmount();
    });
  });
});

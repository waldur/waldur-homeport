import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenStackInstance } from 'waldur-js-client';

import { SetAllowedAddressPairsDialog } from './SetAllowedAddressPairsDialog';

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
  SubmitButton: ({ label, submitting, disabled }: any) => (
    <button type="submit" disabled={submitting || disabled}>
      {label}
    </button>
  ),
  StringField: ({ input }: any) => <input {...input} />,
  FieldError: ({ error }: any) => (error ? <span>{error}</span> : null),
}));

vi.mock('@/modal/CloseDialogButton', () => ({
  CloseDialogButton: () => <button>Close</button>,
}));

const mockMutateAsync = vi.fn();
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

vi.mock('./utils', () => ({
  formatAddressList: () => '192.168.1.100',
}));

const mockInstance = {
  uuid: 'instance-uuid',
  name: 'test-instance',
} as OpenStackInstance;

const mockPort = {
  subnet: 'subnet-url',
  allowed_address_pairs: [
    { ip_address: '10.0.0.1/32', mac_address: 'fa:16:3e:00:00:01' },
  ],
};

describe('SetAllowedAddressPairsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial pairs', () => {
    render(
      <SetAllowedAddressPairsDialog
        resolve={{ instance: mockInstance, port: mockPort as any }}
      />,
    );

    expect(
      screen.getByText(
        'Set allowed address pairs (test-instance / 192.168.1.100)',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10.0.0.1/32')).toBeInTheDocument();
    expect(screen.getByDisplayValue('fa:16:3e:00:00:01')).toBeInTheDocument();
  });

  it('submits the form with modified pairs', async () => {
    render(
      <SetAllowedAddressPairsDialog
        resolve={{ instance: mockInstance, port: mockPort as any }}
      />,
    );

    // Add a new pair
    const addButton = screen.getByRole('button', {
      name: 'Add pair',
    });
    fireEvent.click(addButton);

    // Fill the new pair fields
    const inputs = screen.getAllByRole('textbox');
    // inputs[0], inputs[1] are existing pair. inputs[2], inputs[3] are new pair.
    fireEvent.change(inputs[2], { target: { value: '192.168.2.0/24' } });
    fireEvent.change(inputs[3], { target: { value: 'fa:16:3e:00:00:02' } });

    // Submit
    const submitButton = screen.getByText('Update');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      pairs: [
        { ip_address: '10.0.0.1/32', mac_address: 'fa:16:3e:00:00:01' },
        { ip_address: '192.168.2.0/24', mac_address: 'fa:16:3e:00:00:02' },
      ],
    });
  });
});

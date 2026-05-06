import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { marketplaceProviderOfferingsCreateOfferingComponent } from 'waldur-js-client';

import { useNotify } from '@/store/notify';

import { AddComponentDialog } from './AddComponentDialog';

vi.mock('@/store/notify');
vi.mock('waldur-js-client', () => ({
  marketplaceProviderOfferingsCreateOfferingComponent: vi.fn(),
  formDataBodySerializer: vi.fn(),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
}));

vi.mock('@/form/themed-select', () => ({
  Select: (props) => (
    <select
      value={props.value?.value}
      onChange={(e) => {
        const option = props.options.find(
          (opt) => opt.value === e.target.value,
        );
        props.onChange(option);
      }}
      id={props.inputId}
      disabled={props.isDisabled}
    >
      <option value="">Select...</option>
      {props.options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

const mockOffering = {
  uuid: 'offering-1',
  components: [],
};

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AddComponentDialog
        resolve={
          {
            offering: mockOffering,
            refetch: vi.fn(),
          } as any
        }
      />
    </QueryClientProvider>,
  );
};

describe('AddComponentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
  });

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Add component')).toBeInTheDocument();
  });

  it('submits correct payload', async () => {
    const user = userEvent.setup();
    const createMutation = vi.mocked(
      marketplaceProviderOfferingsCreateOfferingComponent,
    );
    renderComponent();

    // Fill in required fields
    const internalNameInput = screen.getByLabelText(/Internal name/i);
    const displayNameInput = screen.getByLabelText(/Display name/i);

    await user.type(internalNameInput, 'cpu');
    await user.type(displayNameInput, 'CPU Core');

    // Select Accounting type (Billing Type)
    const selectBox = screen.getByLabelText(/Accounting type/i);
    fireEvent.change(selectBox, { target: { value: 'usage' } });

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createMutation).toHaveBeenCalledWith({
        path: { uuid: 'offering-1' },
        body: expect.objectContaining({
          type: 'cpu',
          name: 'CPU Core',
          billing_type: 'usage',
        }),
      });
    });
  });
});

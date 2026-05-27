import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  remoteWaldurApiImportOffering,
  remoteWaldurApiRemoteCustomers,
  remoteWaldurApiSharedOfferings,
  marketplaceCategoriesList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import * as workspaceHooks from '@/workspace/hooks';

import { RemoteOfferingImportDialog } from './RemoteOfferingImportDialog';
vi.mock('@/workspace/hooks');

vi.mock('@uirouter/react');
vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('@/router', () => ({
  router: {
    urlService: {
      config: { strictMode: vi.fn() },
      rules: { initial: vi.fn() },
    },
    stateService: { go: vi.fn(), target: vi.fn() },
  },
}));

vi.mock('react-select', () => ({
  default: ({
    options,
    value,
    onChange,
    inputId,
    isMulti,
    getOptionLabel,
    getOptionValue,
  }) => (
    <select
      id={inputId}
      data-testid={inputId}
      multiple={isMulti}
      value={
        isMulti
          ? (value || []).map(getOptionValue)
          : value
            ? getOptionValue(value)
            : ''
      }
      onChange={(e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(
          (opt) => options.find((o) => String(getOptionValue(o)) === opt.value),
        );
        onChange(isMulti ? selectedOptions : selectedOptions[0]);
      }}
    >
      <option value="">Select...</option>
      {options &&
        options.map((o) => (
          <option key={getOptionValue(o)} value={getOptionValue(o)}>
            {getOptionLabel(o)}
          </option>
        ))}
    </select>
  ),
  components: {
    Option: ({ children }) => <div>{children}</div>,
    SingleValue: ({ children }) => <div>{children}</div>,
    MultiValue: ({ children }) => <div>{children}</div>,
    DropdownIndicator: () => null,
    ClearIndicator: () => null,
  },
}));

const renderDialog = (refetch = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RemoteOfferingImportDialog refetch={refetch} />
    </QueryClientProvider>,
  );
};

describe('RemoteOfferingImportDialog', () => {
  let mockRouter;
  let mockNotify;
  let mockModal;

  beforeEach(() => {
    vi.mocked(workspaceHooks.useCustomer).mockReturnValue({
      uuid: 'local-customer-uuid',
    } as any);

    mockRouter = {
      stateService: { go: vi.fn() },
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter);

    mockNotify = {
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    };
    vi.mocked(useNotify).mockReturnValue(mockNotify);

    mockModal = {
      closeDialog: vi.fn(),
    };
    vi.mocked(useModal).mockReturnValue(mockModal);

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const getNextButton = () =>
    screen
      .queryAllByRole('button', { name: /Next/i })
      .find((b) => b.textContent === 'Next');
  const getConfirmButton = () =>
    screen
      .queryAllByRole('button', { name: /Confirm/i })
      .find((b) => b.textContent === 'Confirm');

  const walkThroughWizard = async (user) => {
    // --- Step 1: Credentials ---
    await user.type(
      screen.getByRole('textbox', { name: /API URL/i }),
      'api.example.com',
    );
    await user.type(screen.getByLabelText(/Authentication token/i), 'secret');
    await user.click(getNextButton());

    // --- Step 2: Organization ---
    await screen.findByText(/Select organization/i);
    await user.selectOptions(
      screen.getByTestId('customer'),
      'remote-customer-uuid',
    );
    await user.click(getNextButton());

    // --- Step 3: Offerings ---
    await screen.findByText(/Choose offerings/i);
    await user.selectOptions(
      screen.getByTestId('offerings'),
      'remote-offering-uuid',
    );
    await user.click(getNextButton());

    // --- Step 4: Categories ---
    await screen.findByText(/Map categories/i);
    const categorySelect = await screen.findByTestId(
      'categories_set[0].local_category',
    );
    await user.selectOptions(categorySelect, 'local-category-uuid');

    await waitFor(() => expect(getNextButton()).not.toBeDisabled());
    await user.click(getNextButton());

    // --- Step 5: Review ---
    await screen.findByText(/Review and confirm/i);
  };

  it('walks through the wizard and handles success and error cases', async () => {
    const user = userEvent.setup();

    // Mocks for successful run
    vi.mocked(remoteWaldurApiRemoteCustomers).mockResolvedValue({
      data: [{ uuid: 'remote-customer-uuid', name: 'Remote Customer' }],
    } as any);
    vi.mocked(remoteWaldurApiSharedOfferings).mockResolvedValue({
      data: [
        {
          uuid: 'remote-offering-uuid',
          name: 'Remote Offering',
          category_title: 'Compute',
          type: 'Standard',
        },
      ],
    } as any);
    vi.mocked(marketplaceCategoriesList).mockResolvedValue({
      data: [{ uuid: 'local-category-uuid', title: 'Local Compute' }],
      response: {
        headers: { get: (name) => (name === 'x-result-count' ? '1' : null) },
      },
    } as any);
    vi.mocked(remoteWaldurApiImportOffering).mockResolvedValue({
      data: { uuid: 'imported-offering-uuid' },
    } as any);

    const { unmount } = renderDialog();
    await walkThroughWizard(user);
    await user.click(getConfirmButton());
    await waitFor(() => {
      expect(remoteWaldurApiImportOffering).toHaveBeenCalledWith({
        body: expect.objectContaining({
          api_url: 'api.example.com',
          token: 'secret',
          remote_offering_uuid: 'remote-offering-uuid',
          remote_customer_uuid: 'remote-customer-uuid',
          local_category_uuid: 'local-category-uuid',
          local_customer_uuid: 'local-customer-uuid',
        }),
      });
    });
    expect(mockNotify.showSuccess).toHaveBeenCalled();
    unmount();
    cleanup();

    // Now test error handling (in a new render)
    const error = new Error('Submission failed');
    vi.mocked(remoteWaldurApiImportOffering).mockRejectedValue(error);
    renderDialog();
    await walkThroughWizard(user);
    await user.click(getConfirmButton());
    await waitFor(() =>
      expect(mockNotify.showErrorResponse).toHaveBeenCalledWith(
        error,
        expect.any(String),
      ),
    );
  });
});

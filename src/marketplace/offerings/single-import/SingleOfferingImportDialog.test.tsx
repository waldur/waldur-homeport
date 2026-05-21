import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { marketplaceProviderOfferingsImportOffering } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { validateOfferingExportFile } from './fileValidation';
import { SingleOfferingImportDialog } from './SingleOfferingImportDialog';

vi.mock('@uirouter/react');
vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('./fileValidation');
vi.mock('@/router', () => ({
  router: {
    urlService: {
      config: { strictMode: vi.fn() },
      rules: { initial: vi.fn() },
    },
    stateService: { go: vi.fn(), target: vi.fn() },
  },
}));

const mockStore = configureStore();

const renderDialog = (store, resolve = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SingleOfferingImportDialog resolve={resolve} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('SingleOfferingImportDialog', () => {
  let store;
  let mockRouter;
  let mockNotify;
  let mockModal;

  beforeEach(() => {
    store = mockStore({
      workspace: {
        customer: { uuid: 'local-customer-uuid' },
      },
    });

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
  const getImportButton = () =>
    screen
      .queryAllByRole('button', { name: /Import/i })
      .find((b) => b.textContent === 'Import');

  it('renders the first step and walks through the full import flow', async () => {
    const user = userEvent.setup();

    vi.mocked(validateOfferingExportFile).mockResolvedValue({
      isValid: true,
      metadata: {
        offering_name: 'Test Offering',
        category_name: 'Compute',
        exported_components: ['plans', 'components'],
      },
    });

    vi.mocked(marketplaceProviderOfferingsImportOffering).mockResolvedValue({
      data: { imported_offering_uuid: 'imported-offering-uuid' },
    } as any);

    const { container } = renderDialog(store);

    // --- Step 1: File Upload ---
    expect(screen.getByText(/Upload offering file/i)).toBeInTheDocument();

    const file = new File(['offering: test'], 'offering.yaml', {
      type: 'text/yaml',
    });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    await screen.findByText('Test Offering');
    await user.click(getNextButton());

    // --- Step 2: Configuration ---
    await screen.findByText(/Configure import/i);
    await user.click(getNextButton());

    // --- Step 3: Review ---
    await screen.findByText(/Review and confirm/i);
    expect(screen.getByText('offering.yaml')).toBeInTheDocument();

    await user.click(getImportButton());

    // Verification
    await waitFor(() => {
      expect(marketplaceProviderOfferingsImportOffering).toHaveBeenCalledWith({
        body: expect.objectContaining({
          customer: 'local-customer-uuid',
          import_plans: true,
          import_components: true,
        }),
      });
    });

    expect(mockNotify.showSuccess).toHaveBeenCalled();
    expect(mockModal.closeDialog).toHaveBeenCalled();
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    const error = new Error('Import failed');
    vi.mocked(marketplaceProviderOfferingsImportOffering).mockRejectedValue(
      error,
    );

    vi.mocked(validateOfferingExportFile).mockResolvedValue({
      isValid: true,
      metadata: {
        offering_name: 'Test Offering',
        exported_components: [],
      },
    });

    const { container } = renderDialog(store);

    const file = new File(['offering: test'], 'offering.yaml', {
      type: 'text/yaml',
    });
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    await screen.findByText('Test Offering');
    await user.click(getNextButton());

    await screen.findByText(/Configure import/i);
    await user.click(getNextButton());

    await screen.findByText(/Review and confirm/i);
    await user.click(getImportButton());

    await waitFor(() => {
      expect(mockNotify.showErrorResponse).toHaveBeenCalledWith(
        error,
        expect.any(String),
      );
    });
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsImportOffering,
  marketplaceCategoriesList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';

import { validateOfferingExportFile } from './fileValidation';
import { SingleOfferingImportDialog } from './SingleOfferingImportDialog';

vi.mock('./fileValidation');

const renderDialog = (resolve = {}) => {
  return renderWithProviders(<SingleOfferingImportDialog resolve={resolve} />);
};

describe('SingleOfferingImportDialog', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useCustomer).mockReturnValue({
      uuid: 'local-customer-uuid',
    } as any);

    vi.mocked(marketplaceCategoriesList).mockResolvedValue(
      mockListResponse([{ uuid: 'compute-uuid', title: 'Compute' }]),
    );

    vi.clearAllMocks();
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

    renderDialog();

    // --- Step 1: File Upload ---
    expect(screen.getByText(/Upload offering file/i)).toBeInTheDocument();

    const file = new File(['offering: test'], 'offering.yaml', {
      type: 'text/yaml',
    });
    const input = screen.getByTestId('file-uploader');
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

    expect(useNotify().showSuccess).toHaveBeenCalled();
    expect(useModal().closeDialog).toHaveBeenCalled();
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

    renderDialog();

    const file = new File(['offering: test'], 'offering.yaml', {
      type: 'text/yaml',
    });
    const input = screen.getByTestId('file-uploader');
    await user.upload(input, file);

    await screen.findByText('Test Offering');
    await user.click(getNextButton());

    await screen.findByText(/Configure import/i);
    await user.click(getNextButton());

    await screen.findByText(/Review and confirm/i);
    await user.click(getImportButton());

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        expect.any(String),
      );
    });
  });
});

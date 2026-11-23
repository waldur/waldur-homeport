import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowSettingsList,
  adminArrowVendorOfferingMappingsList,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { ForceImportConsumptionDialog } from './ForceImportConsumptionDialog';

describe('ForceImportConsumptionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminArrowSettingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'settings-uuid' }]),
    );
    vi.mocked(marketplaceResourcesList).mockResolvedValue(mockListResponse([]));
  });

  it('only searches resources of offerings mapped to an Arrow vendor', async () => {
    const user = userEvent.setup();
    vi.mocked(adminArrowVendorOfferingMappingsList).mockResolvedValue(
      mockListResponse([
        { offering_uuid: 'offering-1' },
        { offering_uuid: 'offering-2' },
        { offering_uuid: 'offering-1' },
      ]),
    );

    renderWithProviders(<ForceImportConsumptionDialog resolve={{}} />);

    await waitFor(() =>
      expect(adminArrowVendorOfferingMappingsList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            settings_uuid: 'settings-uuid',
            is_active: true,
          }),
        }),
      ),
    );

    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toBeEnabled());
    await user.type(input, 'vm');

    await waitFor(() =>
      expect(marketplaceResourcesList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            // One comma-separated value: the backend keeps only the last of
            // repeated params.
            offering_uuid: ['offering-1,offering-2'],
          }),
        }),
      ),
    );
  });

  it('warns and does not search resources when no offering is mapped', async () => {
    vi.mocked(adminArrowVendorOfferingMappingsList).mockResolvedValue(
      mockListResponse([]),
    );

    renderWithProviders(<ForceImportConsumptionDialog resolve={{}} />);

    expect(
      await screen.findByText(/No offerings are mapped to Arrow vendors/),
    ).toBeInTheDocument();
    expect(marketplaceResourcesList).not.toHaveBeenCalled();
  });

  it('shows the load error instead of the no-mapping warning when mappings fail', async () => {
    vi.mocked(adminArrowVendorOfferingMappingsList).mockRejectedValue(
      new Error('boom'),
    );

    renderWithProviders(<ForceImportConsumptionDialog resolve={{}} />);

    expect(
      await screen.findByText('Failed to load Arrow offering mappings'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/No offerings are mapped to Arrow vendors/),
    ).not.toBeInTheDocument();
  });
});

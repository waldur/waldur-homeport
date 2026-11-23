import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminArrowSettingsPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ArrowSettingsEditDialog } from './ArrowSettingsEditDialog';

const settings = {
  uuid: 'settings-uuid',
  api_url: 'https://arrow.example/api/',
  export_type_reference: 'E1',
  classification_filter: 'IAAS',
  sync_enabled: true,
  invoice_price_source: 'sell',
} as any;

describe('ArrowSettingsEditDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts the API key empty and keeps the stored key when left empty', async () => {
    const user = userEvent.setup();
    vi.mocked(adminArrowSettingsPartialUpdate).mockResolvedValue({} as any);

    renderWithProviders(
      <ArrowSettingsEditDialog resolve={{ settings, refetch: vi.fn() }} />,
    );

    expect(screen.getByLabelText(/API Key/)).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(adminArrowSettingsPartialUpdate).toHaveBeenCalled(),
    );
    const body = vi.mocked(adminArrowSettingsPartialUpdate).mock.calls[0][0]
      .body as Record<string, unknown>;
    expect(body).not.toHaveProperty('api_key');
  });

  it('shows the field error the API returns', async () => {
    const user = userEvent.setup();
    // The API client spreads a DRF error body onto the error object.
    vi.mocked(adminArrowSettingsPartialUpdate).mockRejectedValue({
      status: 400,
      statusText: 'Bad Request',
      api_url: ['Enter a valid URL.'],
    });

    renderWithProviders(
      <ArrowSettingsEditDialog resolve={{ settings, refetch: vi.fn() }} />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(/api_url: Enter a valid URL\./),
    ).toBeInTheDocument();
  });
});

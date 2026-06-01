import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateIntegration } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { EditScriptLanguageDialog } from './EditScriptLanguageDialog';

const fakeOffering = {
  uuid: 'offering-uuid',
  name: 'Test Offering',
  secret_options: {
    language: 'python',
  },
};

const renderDialog = (type = 'language') => {
  return renderWithProviders(
    <EditScriptLanguageDialog
      resolve={
        {
          offering: fakeOffering as any,
          type: type,
          label: 'Script Language',
          refetch: vi.fn(),
        } as any
      }
    />,
  );
};

describe('EditScriptLanguageDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial value from offering secret_options', () => {
    renderDialog();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('updates offering integration on submission', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    // Open select and change value
    await openAndSelectOption(user, /Script Language/i, 'Bash');

    await user.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(
        marketplaceProviderOfferingsUpdateIntegration,
      ).toHaveBeenCalledWith({
        path: { uuid: 'offering-uuid' },
        body: {
          secret_options: {
            language: 'shell',
          },
        },
      });
    });
  });
});

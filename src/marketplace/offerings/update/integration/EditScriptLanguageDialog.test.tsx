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

const renderDialog = (type = 'language', offering: any = fakeOffering) => {
  return renderWithProviders(
    <EditScriptLanguageDialog
      resolve={
        {
          offering: offering as any,
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

  // secret_options is absent from the payload of a user who may not see it.
  it('renders without an initial value when secret_options are not visible', () => {
    renderDialog('language', { uuid: 'offering-uuid', name: 'Test Offering' });
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
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

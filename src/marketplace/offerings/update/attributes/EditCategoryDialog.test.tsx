import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateDescription } from 'waldur-js-client';

import { getCategories } from '@/marketplace/common/api';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { EditCategoryDialog } from './EditCategoryDialog';

vi.mock('@/marketplace/common/api', () => ({
  getCategories: vi.fn(),
}));

describe('EditCategoryDialog', () => {
  const mockResolve = {
    offering: { uuid: 'offering-uuid', category: 'cat-url-1' },
    refetch: vi.fn(),
  };

  const mockCategories = [
    { url: 'cat-url-1', title: 'Category 1' },
    { url: 'cat-url-2', title: 'Category 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCategories).mockResolvedValue(mockCategories);
  });

  const renderComponent = () => {
    return renderWithProviders(<EditCategoryDialog resolve={mockResolve} />);
  };

  it('renders loading state then categories', async () => {
    renderComponent();
    expect(screen.getByTestId('SpinnerIcon')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Edit category')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateDescription).mockResolvedValue(
      {} as any,
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('SpinnerIcon')).not.toBeInTheDocument();
    });

    // Select Category 2
    await openAndSelectOption(user, /Category/i, 'Category 2');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        marketplaceProviderOfferingsUpdateDescription,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: { category: 'cat-url-2' },
        }),
      );
    });

    await waitFor(() => {
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });
});

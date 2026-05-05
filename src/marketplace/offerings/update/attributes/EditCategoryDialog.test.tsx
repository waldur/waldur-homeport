import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { marketplaceProviderOfferingsUpdateDescription } from 'waldur-js-client';

import { getCategories } from '@/marketplace/common/api';

import { EditCategoryDialog } from './EditCategoryDialog';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    marketplaceProviderOfferingsUpdateDescription: vi.fn(),
  };
});

vi.mock('@/marketplace/common/api', () => ({
  getCategories: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

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
    queryClient.clear();
    vi.mocked(getCategories).mockResolvedValue(mockCategories);
    vi.mocked(useDispatch).mockReturnValue(vi.fn());
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditCategoryDialog resolve={mockResolve} />
      </QueryClientProvider>,
    );
  };

  it('renders loading state then categories', async () => {
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Edit category')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    vi.mocked(marketplaceProviderOfferingsUpdateDescription).mockResolvedValue(
      {} as any,
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    // Select Category 2
    const select = screen.getByRole('combobox');
    fireEvent.focus(select);
    fireEvent.keyDown(select, { key: 'ArrowDown', code: 'ArrowDown' });
    const option2 = await screen.findByText('Category 2');
    fireEvent.click(option2);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { EditAttributeDialog } from './EditAttributeDialog';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('waldur-js-client');

vi.mock('../../store/utils', () => ({
  formatAttribute: vi.fn((_attr, value) => value),
}));

vi.mock('../utils', () => ({
  parseAttribute: vi.fn((_attr, value) => value),
  configAttrField: vi.fn(() => ({ type: 'text' })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('EditAttributeDialog', () => {
  const mockResolve = {
    offering: { uuid: 'offering-uuid', attributes: {} },
    section: { title: 'Section 1' },
    attribute: { key: 'attr-1', title: 'Attribute 1', type: 'string' },
    value: 'old-value',
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(vi.fn());
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EditAttributeDialog resolve={mockResolve} />
      </QueryClientProvider>,
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Edit attribute')).toBeInTheDocument();
    expect(screen.getByText(/Section:/)).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText(/Attribute:/)).toBeInTheDocument();
    expect(screen.getByText('Attribute 1')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    vi.mocked(marketplaceProviderOfferingsUpdateAttributes).mockResolvedValue(
      {} as any,
    );
    const { container } = renderComponent();

    const input = container.querySelector('input[name="value"]')!;
    fireEvent.change(input, { target: { value: 'new-value' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateAttributes).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            'attr-1': 'new-value',
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });
});

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EditAttributeDialog } from './EditAttributeDialog';

vi.mock('../../store/utils', () => ({
  formatAttribute: vi.fn((_attr, value) => value),
}));

vi.mock('../utils', () => ({
  parseAttribute: vi.fn((_attr, value) => value),
  configAttrField: vi.fn(() => ({ type: 'text' })),
}));
describe('EditAttributeDialog', () => {
  const mockResolve = {
    offering: { uuid: 'offering-uuid', attributes: {} },
    section: { title: 'Section 1' },
    attribute: { key: 'attr-1', title: 'Attribute 1', type: 'string' },
    value: 'old-value',
    refetch: vi.fn(),
  };

  const renderComponent = () => {
    return renderWithProviders(<EditAttributeDialog resolve={mockResolve} />);
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

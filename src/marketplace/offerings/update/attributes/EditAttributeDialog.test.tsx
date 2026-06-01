import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EditAttributeDialog } from './EditAttributeDialog';

vi.mock('../../store/utils', () => ({
  formatAttribute: vi.fn((_attr, value) => value),
}));

vi.mock('../utils', () => ({
  parseAttribute: vi.fn((_attr, value) => value),
  configAttrField: vi.fn(() => ({ type: 'text', label: 'Attribute Value' })),
}));

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
  });

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
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateAttributes).mockResolvedValue(
      {} as any,
    );
    renderComponent();

    // The label is now provided by attribute.title via AttributeCell
    const input = screen.getByLabelText(/Attribute 1/i);
    await user.clear(input);
    await user.type(input, 'new-value');

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateAttributes).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            'attr-1': 'new-value',
          }),
        }),
      );
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });
});

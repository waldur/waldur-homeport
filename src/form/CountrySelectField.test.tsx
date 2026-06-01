import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customersCountriesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CountrySelectField } from './CountrySelectField';

const mockCountries = [
  { label: 'Estonia', value: 'EE' },
  { label: 'Germany', value: 'DE' },
  { label: 'United States', value: 'US' },
];

describe('CountrySelectField', () => {
  const createMockInput = (value = '') => ({
    name: 'country',
    value,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersCountriesList).mockResolvedValue({
      data: mockCountries,
    } as any);
  });

  it('renders the component', async () => {
    const mockInput = createMockInput();
    renderWithProviders(<CountrySelectField input={mockInput as any} />);

    await waitFor(() => {
      expect(customersCountriesList).toHaveBeenCalled();
    });

    // Check that the select is rendered
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('renders with placeholder', async () => {
    const mockInput = createMockInput();
    renderWithProviders(
      <CountrySelectField
        input={mockInput as any}
        placeholder="Select a country"
      />,
    );

    await waitFor(() => {
      expect(customersCountriesList).toHaveBeenCalled();
    });

    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  it('displays selected country', async () => {
    const mockInput = createMockInput('EE');
    renderWithProviders(<CountrySelectField input={mockInput as any} />);

    await waitFor(() => {
      expect(screen.getByText('Estonia')).toBeInTheDocument();
    });
  });

  it('calls onChange when country is selected', async () => {
    const user = userEvent.setup();
    const mockInput = createMockInput();
    renderWithProviders(<CountrySelectField input={mockInput as any} />);

    await waitFor(() => {
      expect(customersCountriesList).toHaveBeenCalled();
    });

    // Open the dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // Select Germany
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Germany'));

    expect(mockInput.onChange).toHaveBeenCalledWith('DE');
  });

  it('clears selection when clearable', async () => {
    const user = userEvent.setup();
    const mockInput = createMockInput('EE');
    const { container } = renderWithProviders(
      <CountrySelectField input={mockInput as any} isClearable />,
    );

    await waitFor(() => {
      expect(screen.getByText('Estonia')).toBeInTheDocument();
    });

    // Find the clear indicator by class (react-select uses aria-hidden on indicators)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const clearIndicator = container.querySelector(
      '.metronic-select__clear-indicator',
    );
    expect(clearIndicator).toBeInTheDocument();
    await user.click(clearIndicator!);

    expect(mockInput.onChange).toHaveBeenCalledWith(null);
  });
});

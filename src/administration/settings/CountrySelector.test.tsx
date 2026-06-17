import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { overrideSettings } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { CountrySelectorDialog } from './CountrySelector';

describe('CountrySelectorDialog', () => {
  const resolve = {
    value: ['EE', 'LT'],
    settingKey: 'COUNTRIES',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders available countries and shows selected ones', () => {
    renderWithProviders(<CountrySelectorDialog resolve={resolve} />);

    // EE and LT should be checked
    const eeCheckbox = screen.getByTestId('country_EE');
    const ltCheckbox = screen.getByTestId('country_LT');
    const deCheckbox = screen.getByTestId('country_DE');

    expect(eeCheckbox).toBeChecked();
    expect(ltCheckbox).toBeChecked();
    expect(deCheckbox).not.toBeChecked();
  });

  it('filters countries based on query', () => {
    vi.useFakeTimers();
    renderWithProviders(<CountrySelectorDialog resolve={resolve} />);

    const queryInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(queryInput, { target: { value: 'EE' } }); // eslint-disable-line testing-library/prefer-user-event

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText('EE')).toBeInTheDocument();
    expect(screen.queryByText('DE')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('updates selection when clicking on a country', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CountrySelectorDialog resolve={resolve} />);

    const deCheckbox = screen.getByTestId('country_DE');
    await user.click(deCheckbox);

    expect(deCheckbox).toBeChecked();
  });

  it('calls overrideSettings when clicking Save', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CountrySelectorDialog resolve={resolve} />);

    // Change something to make it dirty
    const deCheckbox = screen.getByTestId('country_DE');
    await user.click(deCheckbox);

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(overrideSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            COUNTRIES: ['DE', 'EE', 'LT'],
          },
        }),
      );
    });
  });

  it('shows error if no countries are selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CountrySelectorDialog resolve={resolve} />);

    // Deselect all
    const eeCheckbox = screen.getByTestId('country_EE');
    const ltCheckbox = screen.getByTestId('country_LT');
    await user.click(eeCheckbox);
    await user.click(ltCheckbox);

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(overrideSettings).not.toHaveBeenCalled();
    });
    expect(useNotify().showError).toHaveBeenCalledWith(
      'Please select at least one country',
    );
  });
});

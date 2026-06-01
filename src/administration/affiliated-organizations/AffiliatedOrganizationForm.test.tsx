import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  affiliatedOrganizationsCreate,
  affiliatedOrganizationsPartialUpdate,
  customersCountriesList,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { AffiliatedOrganizationForm } from './AffiliatedOrganizationForm';

const mockCountries = [
  { label: 'Estonia', value: 'EE' },
  { label: 'Germany', value: 'DE' },
];

describe('AffiliatedOrganizationForm', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersCountriesList).mockResolvedValue({
      data: mockCountries,
    } as any);
  });

  it('renders "Create affiliation" dialog correctly', () => {
    renderWithProviders(
      <AffiliatedOrganizationForm resolve={{ refetch: mockRefetch }} />,
    );
    expect(screen.getByText('Create affiliation')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code/)).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders "Edit {name}" dialog with initial values', () => {
    const affiliatedOrganization = {
      uuid: 'org-uuid',
      name: 'Existing Org',
      code: 'EXISTING',
      abbreviation: 'EO',
      description: 'Existing Description',
      email: 'test@example.com',
      homepage: 'https://example.com',
      country: 'EE',
      address: 'Tallinn',
    };
    renderWithProviders(
      <AffiliatedOrganizationForm
        resolve={{ affiliatedOrganization, refetch: mockRefetch }}
      />,
    );
    expect(screen.getByText('Edit Existing Org')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Org')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EXISTING')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EO')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Existing Description'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tallinn')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AffiliatedOrganizationForm resolve={{ refetch: mockRefetch }} />,
    );

    const createButton = screen.getByText('Create');
    expect(createButton).toBeDisabled();

    const nameInput = screen.getByLabelText(/Name/);
    await user.type(nameInput, 'New Org');
    expect(createButton).toBeDisabled();

    const codeInput = screen.getByLabelText(/Code/);
    await user.type(codeInput, 'NEW');

    await waitFor(() => {
      expect(createButton).toBeEnabled();
    });

    await user.clear(nameInput);
    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });

  it('handles successful organization creation with all fields', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(affiliatedOrganizationsCreate)
      .mockResolvedValue({} as any);

    renderWithProviders(
      <AffiliatedOrganizationForm resolve={{ refetch: mockRefetch }} />,
    );

    await user.type(screen.getByLabelText(/Name/), 'New Org');
    await user.type(screen.getByLabelText(/Code/), 'NEW');
    await user.type(screen.getByLabelText(/Abbreviation/), 'NO');
    await user.type(screen.getByLabelText(/Description/), 'New Description');
    await user.type(screen.getByLabelText(/Email/), 'test@example.com');
    await user.type(screen.getByLabelText(/Homepage/), 'https://example.com');
    await user.type(screen.getByLabelText(/Address/), 'Test Address');

    // Country selection
    await openAndSelectOption(user, 'Country', 'Estonia');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'New Org',
          code: 'NEW',
          abbreviation: 'NO',
          description: 'New Description',
          email: 'test@example.com',
          homepage: 'https://example.com',
          country: 'EE',
          address: 'Test Address',
        }),
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles successful organization update with all fields', async () => {
    const user = userEvent.setup();
    const updateSpy = vi
      .mocked(affiliatedOrganizationsPartialUpdate)
      .mockResolvedValue({} as any);
    const affiliatedOrganization = {
      uuid: 'org-uuid',
      name: 'Existing Org',
      code: 'EXISTING',
      country: 'EE',
    };

    renderWithProviders(
      <AffiliatedOrganizationForm
        resolve={{ affiliatedOrganization, refetch: mockRefetch }}
      />,
    );

    const nameInput = screen.getByDisplayValue('Existing Org');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Org');

    // Change country
    await openAndSelectOption(user, 'Country', 'Germany');

    await user.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        path: { uuid: 'org-uuid' },
        body: expect.objectContaining({
          name: 'Updated Org',
          country: 'DE',
        }),
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles API failure during organization creation', async () => {
    const user = userEvent.setup();
    const error = new Error('API Error');
    vi.mocked(affiliatedOrganizationsCreate).mockRejectedValue(error);

    renderWithProviders(
      <AffiliatedOrganizationForm resolve={{ refetch: mockRefetch }} />,
    );

    await user.type(screen.getByLabelText(/Name/), 'New Org');
    await user.type(screen.getByLabelText(/Code/), 'NEW');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(affiliatedOrganizationsCreate).toHaveBeenCalled();
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to create affiliation.',
      );
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rolesRetrieve, rolesUpdateDescriptionsUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { RoleDescriptionEditDialog } from './RoleDescriptionEditDialog';
import { getRoles } from './utils';

// Mock dependencies

vi.mock('./utils');

describe('RoleDescriptionEditDialog', () => {
  // The list row only carries a `uuid`; the per-language descriptions are
  // fetched on open via rolesRetrieve.
  const mockRow = { uuid: 'test-uuid' };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.languageChoices = [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Estonian' },
    ];
    vi.mocked(rolesRetrieve).mockResolvedValue({
      data: {
        uuid: 'test-uuid',
        description_en: 'English description',
        description_et: 'Estonian description',
      },
    } as any);
  });

  it('renders form with language inputs', async () => {
    renderWithProviders(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    expect(
      await screen.findByDisplayValue('English description'),
    ).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Estonian')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Estonian description'),
    ).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    const updateRoleDescriptionsSpy = vi
      .mocked(rolesUpdateDescriptionsUpdate)
      .mockResolvedValue(undefined);
    const getRolesSpy = vi.mocked(getRoles).mockResolvedValue([]);

    renderWithProviders(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    const englishInput = await screen.findByDisplayValue('English description');
    await user.clear(englishInput);
    await user.type(englishInput, 'Updated English description');

    const submitButton = screen.getByText('Save');
    await user.click(submitButton);

    expect(updateRoleDescriptionsSpy).toHaveBeenCalledWith({
      path: { uuid: 'test-uuid' },
      body: {
        description_en: 'Updated English description',
        description_et: 'Estonian description',
      },
    });
    expect(getRolesSpy).toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows an error state instead of the form when the role fails to load', async () => {
    vi.mocked(rolesRetrieve).mockRejectedValue({ response: { status: 404 } });
    renderWithProviders(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    expect(
      await screen.findByText('Unable to load role description.'),
    ).toBeInTheDocument();
    // No Save button → the validator-free form can't submit empty strings and
    // wipe the role's existing translations.
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });
});

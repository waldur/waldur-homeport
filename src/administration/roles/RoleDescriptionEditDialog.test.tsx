import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rolesUpdateDescriptionsUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';

import { RoleDescriptionEditDialog } from './RoleDescriptionEditDialog';
import { getRoles } from './utils';

// Mock dependencies

vi.mock('./utils');

describe('RoleDescriptionEditDialog', () => {
  const mockRow = {
    uuid: 'test-uuid',
    description_en: 'English description',
    description_et: 'Estonian description',
  };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.languageChoices = [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Estonian' },
    ];
  });

  it('renders form with language inputs', () => {
    render(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Estonian')).toBeInTheDocument();
    expect(screen.getByDisplayValue('English description')).toBeInTheDocument();
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

    render(
      <RoleDescriptionEditDialog
        resolve={{ row: mockRow, refetch: mockRefetch }}
      />,
    );

    const englishInput = screen.getByDisplayValue('English description');
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
});

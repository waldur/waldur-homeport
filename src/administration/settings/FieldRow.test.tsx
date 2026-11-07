import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettingsSourcesList } from 'waldur-js-client';

import { PropertyList } from 'waldur-ui';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { FieldRow } from './FieldRow';

const item = { key: 'SITE_NAME', description: 'Site name', type: 'string' };

const renderRow = (sources: object[], props = {}) => {
  vi.mocked(overrideSettingsSourcesList).mockResolvedValue({
    data: sources,
  } as any);
  return renderWithProviders(
    <PropertyList>
      <FieldRow item={item} value="Portal" {...props} />
    </PropertyList>,
  );
};

const siteName = {
  key: 'SITE_NAME',
  description: 'Human-friendly name of the deployment.',
  default: 'Waldur',
  type: 'string',
};

const freeipaPassword = {
  key: 'FREEIPA_PASSWORD',
  description: 'Password of FreeIPA user.',
  default: 'secret',
  type: 'secret_field',
};

const renderItem = (row, value) => {
  vi.mocked(overrideSettingsSourcesList).mockResolvedValue({
    data: [],
  } as any);
  return renderWithProviders(
    <PropertyList>
      <FieldRow item={row} value={value} />
    </PropertyList>,
  );
};

const editButton = () => screen.getByRole('button', { name: /Edit/ });

describe('FieldRow', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-branding' } as any,
      params: {},
    });
    vi.mocked(overrideSettingsSourcesList).mockReset();
  });

  it('anchors the row and highlights it when linked with ?setting=', () => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-branding' } as any,
      params: { setting: 'SITE_NAME' },
    });
    renderItem(siteName, 'Waldur');

    const row = screen.getByTestId('setting-SITE_NAME');
    expect(row).toHaveAttribute('id', 'setting-SITE_NAME');
    expect(row).toHaveClass('bg-warning-subtle');
  });

  it('marks a value that differs from the default', () => {
    renderItem(siteName, 'My Cloud');

    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('does not mark a secret that was blanked for a support user', () => {
    vi.mocked(useUser).mockReturnValue({ is_support: true } as any);
    renderItem(freeipaPassword, '');

    expect(screen.queryByText('Modified')).not.toBeInTheDocument();
  });

  it('cannot be edited when the deployment manages the setting', async () => {
    renderRow([
      {
        key: 'SITE_NAME',
        source: 'deployment',
        source_detail: 'whitelabeling.yaml',
        locked: true,
        managed_by: 'whitelabeling.yaml',
      },
    ]);

    expect(
      await screen.findByText('Managed by deployment · whitelabeling.yaml'),
    ).toBeInTheDocument();
    expect(editButton()).toBeDisabled();
  });

  it('can be edited when the deployment only seeded the setting', async () => {
    renderRow([
      {
        key: 'SITE_NAME',
        source: 'deployment',
        source_detail: 'languages.yaml',
        locked: false,
        managed_by: '',
      },
    ]);

    expect(await screen.findByText('Set by deployment')).toBeInTheDocument();
    expect(editButton()).toBeEnabled();
  });

  it('warns that a deploy re-applies a setting it does not lock', async () => {
    renderRow([
      {
        key: 'SITE_NAME',
        source: 'api',
        source_detail: '',
        locked: false,
        managed_by: 'init_matrix_settings',
      },
    ]);

    expect(
      await screen.findByText('Re-applied on deploy · init_matrix_settings'),
    ).toBeInTheDocument();
    expect(editButton()).toBeEnabled();
  });

  it('warns in the edit dialog once the sources arrive', async () => {
    // Sources load after the row first renders, as on most settings pages.
    renderRow([
      {
        key: 'SITE_NAME',
        source: 'api',
        source_detail: '',
        locked: false,
        managed_by: 'init_matrix_settings',
      },
    ]);
    await screen.findByText('Re-applied on deploy · init_matrix_settings');

    await userEvent.click(editButton());

    expect(vi.mocked(useModal)().openDialog).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        resolve: expect.objectContaining({
          warning: expect.stringContaining('init_matrix_settings'),
        }),
      }),
    );
  });

  it('shows no badge for a setting an administrator changed', async () => {
    renderRow([
      {
        key: 'SITE_NAME',
        source: 'api',
        source_detail: '',
        locked: false,
        managed_by: '',
      },
    ]);

    await vi.waitFor(() =>
      expect(overrideSettingsSourcesList).toHaveBeenCalled(),
    );
    expect(screen.queryByText(/deployment/)).not.toBeInTheDocument();
    expect(editButton()).toBeEnabled();
  });

  it('keeps the reason given by the caller', async () => {
    renderRow(
      [
        {
          key: 'SITE_NAME',
          source: 'deployment',
          source_detail: 'whitelabeling.yaml',
          locked: true,
          managed_by: 'whitelabeling.yaml',
        },
      ],
      { editDisabledReason: 'Managed by the Matrix deployment' },
    );

    await screen.findByText('Managed by deployment · whitelabeling.yaml');
    expect(editButton()).toBeDisabled();
    expect(editButton()).toHaveAccessibleDescription(
      'Managed by the Matrix deployment',
    );
  });

  it('explains why a locked setting cannot be edited', async () => {
    renderRow([
      {
        key: 'SITE_NAME',
        source: 'deployment',
        source_detail: 'whitelabeling.yaml',
        locked: true,
        managed_by: 'whitelabeling.yaml',
      },
    ]);

    await screen.findByText('Managed by deployment · whitelabeling.yaml');
    expect(editButton()).toHaveAccessibleDescription(
      /Managed by the deployment \(whitelabeling\.yaml\)/,
    );
  });

  it('offers no edit button for a list field without an edit handler', async () => {
    vi.mocked(overrideSettingsSourcesList).mockResolvedValue({
      data: [],
    } as any);
    renderWithProviders(
      <PropertyList>
        <FieldRow
          item={{
            key: 'COUNTRIES',
            description: 'Countries',
            type: 'country_list_field',
          }}
          value={['EE']}
        />
      </PropertyList>,
    );

    await vi.waitFor(() =>
      expect(overrideSettingsSourcesList).toHaveBeenCalled(),
    );
    expect(screen.queryByRole('button', { name: /Edit/ })).toBeNull();
  });

  it('renders a dash for an empty multiple_choice_field', () => {
    const multiChoice = {
      key: 'DISABLED_OFFERING_TYPES',
      description: 'Disabled offering types.',
      default: [],
      type: 'multiple_choice_field',
      options: [{ value: 'support', label: 'Support' }],
    };
    renderItem(multiChoice, []);

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

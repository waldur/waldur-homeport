import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { AdministrationSettingsExplorer } from './AdministrationSettingsExplorer';

vi.mock('@/SettingsDescription', () => ({
  SettingsDescription: [
    {
      description: 'Branding',
      items: [
        {
          key: 'SITE_NAME',
          description: 'Human-friendly name of the deployment.',
          default: 'Waldur',
          type: 'string',
        },
        {
          key: 'SHORT_PAGE_TITLE',
          description: 'It is used as prefix for page title.',
          default: 'Waldur',
          type: 'string',
        },
      ],
    },
    {
      description: 'FreeIPA settings',
      items: [
        {
          key: 'FREEIPA_PASSWORD',
          description: 'Password of FreeIPA user.',
          default: 'secret',
          type: 'secret_field',
        },
      ],
    },
    {
      description: 'System Logging',
      items: [
        {
          key: 'SYSTEM_LOG_ENABLED',
          description: 'Store logs in the database.',
          default: true,
          type: 'boolean',
        },
      ],
    },
  ],
}));

const renderExplorer = async (params: Record<string, string> = {}) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'admin-settings-explorer' } as any,
    params,
  });
  renderWithProviders(<AdministrationSettingsExplorer />);
  await screen.findByText('All settings');
};

describe('AdministrationSettingsExplorer', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(overrideSettingsRetrieve).mockResolvedValue({
      data: {
        SITE_NAME: 'My Cloud',
        SHORT_PAGE_TITLE: 'Waldur',
        FREEIPA_PASSWORD: '',
        SYSTEM_LOG_ENABLED: true,
      },
    } as any);
  });

  it('matches the query against keys, titles and descriptions', async () => {
    await renderExplorer({ q: 'prefix' });

    expect(screen.getByText('Short page title')).toBeInTheDocument();
    expect(screen.queryByText('Site name')).not.toBeInTheDocument();
    expect(screen.queryByText('System log enabled')).not.toBeInTheDocument();
  });

  it('shows only the settings of the selected category', async () => {
    await renderExplorer({ category: 'system-management' });

    expect(screen.getByText('System log enabled')).toBeInTheDocument();
    expect(screen.queryByText('Site name')).not.toBeInTheDocument();
    expect(screen.queryByText('Freeipa password')).not.toBeInTheDocument();
  });

  it('shows only settings that differ from their default', async () => {
    await renderExplorer({ modified: 'true' });

    expect(screen.getByText('Site name')).toBeInTheDocument();
    // Staff read the real secret, so an empty one differs from its default
    expect(screen.getByText('Freeipa password')).toBeInTheDocument();
    expect(screen.queryByText('Short page title')).not.toBeInTheDocument();
    expect(screen.queryByText('System log enabled')).not.toBeInTheDocument();
  });

  it('does not count secrets blanked for support as modified', async () => {
    vi.mocked(useUser).mockReturnValue({ is_support: true } as any);
    await renderExplorer({ modified: 'true' });

    expect(screen.getByText('Site name')).toBeInTheDocument();
    expect(screen.queryByText('Freeipa password')).not.toBeInTheDocument();
  });
});

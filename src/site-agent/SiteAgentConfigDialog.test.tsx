import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceServiceProvidersGenerateSiteAgentConfig } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { SiteAgentConfigDialog } from './SiteAgentConfigDialog';

const renderDialog = () =>
  renderWithProviders(
    <SiteAgentConfigDialog
      resolve={{
        provider: { uuid: 'provider-uuid' },
        fixedOffering: { uuid: 'offering-uuid', name: 'HPC cluster' },
      }}
    />,
  );

describe('SiteAgentConfigDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      marketplaceServiceProvidersGenerateSiteAgentConfig,
    ).mockResolvedValue({ data: 'offerings: []\n' } as any);
  });

  const sentBody = async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'Generate Configuration' }),
    );
    await waitFor(() =>
      expect(
        marketplaceServiceProvidersGenerateSiteAgentConfig,
      ).toHaveBeenCalled(),
    );
    return vi.mocked(marketplaceServiceProvidersGenerateSiteAgentConfig).mock
      .calls[0][0].body;
  };

  it('generates the whole configuration by default', async () => {
    renderDialog();
    expect(
      screen.getByLabelText('Include SLURM policy settings'),
    ).toBeInTheDocument();
    const body = await sentBody();
    expect(body).not.toHaveProperty('configuration_source');
    expect(body.include_policy_settings).toBe(true);
  });

  it('asks for a file that reads the configuration from Waldur', async () => {
    renderDialog();
    await userEvent.click(screen.getByLabelText(/Read from Waldur/));
    expect(
      screen.queryByLabelText('Include SLURM policy settings'),
    ).not.toBeInTheDocument();
    const body = await sentBody();
    expect(body).toMatchObject({
      offering_uuids: ['offering-uuid'],
      configuration_source: 'waldur',
    });
    expect(body).not.toHaveProperty('include_policy_settings');
  });
});

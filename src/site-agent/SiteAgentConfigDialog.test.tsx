import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceServiceProvidersGenerateSiteAgentConfig,
  marketplaceServiceProvidersOfferingsList,
} from 'waldur-js-client';

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

const renderProviderDialog = () =>
  renderWithProviders(
    <SiteAgentConfigDialog resolve={{ provider: { uuid: 'provider-uuid' } }} />,
  );

describe('SiteAgentConfigDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      marketplaceServiceProvidersGenerateSiteAgentConfig,
    ).mockResolvedValue({ data: 'offerings: []\n' } as any);
    vi.mocked(marketplaceServiceProvidersOfferingsList).mockResolvedValue({
      data: [
        { uuid: 'dora-q', name: 'alps-dora-q' },
        { uuid: 'dora-u', name: 'alps-dora-u' },
      ],
    } as any);
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

  it('selects the offerings of a cluster by backend ID prefix', async () => {
    renderProviderDialog();
    await userEvent.click(await screen.findByLabelText(/By backend ID/));
    const generate = screen.getByRole('button', {
      name: 'Generate Configuration',
    });
    expect(generate).toBeDisabled();
    await userEvent.type(screen.getByTestId('backend-id'), ' alps-dora ');
    const body = await sentBody();
    expect(body).toEqual(
      expect.objectContaining({ backend_id_startswith: 'alps-dora' }),
    );
    expect(body).not.toHaveProperty('offering_uuids');
    expect(body).not.toHaveProperty('backend_id');
  });

  it('matches a backend ID exactly', async () => {
    renderProviderDialog();
    await userEvent.click(await screen.findByLabelText(/By backend ID/));
    await userEvent.selectOptions(
      screen.getByTestId('backend-id-match'),
      'exact',
    );
    await userEvent.type(screen.getByTestId('backend-id'), 'alps-dora-q');
    const body = await sentBody();
    expect(body).toEqual(
      expect.objectContaining({ backend_id: 'alps-dora-q' }),
    );
    expect(body).not.toHaveProperty('backend_id_startswith');
  });

  it('still picks offerings one by one by default', async () => {
    renderProviderDialog();
    await userEvent.click(await screen.findByLabelText(/alps-dora-u/));
    const body = await sentBody();
    expect(body.offering_uuids).toEqual(['dora-u']);
  });
});

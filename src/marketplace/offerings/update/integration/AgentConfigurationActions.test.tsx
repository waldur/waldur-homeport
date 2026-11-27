import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsSiteAgentConfigRetrieve,
  marketplaceProviderOfferingsTemplateDiffRetrieve,
  marketplaceServiceProvidersList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { AgentConfigurationActions } from './AgentConfigurationActions';
import { AgentLoadsDialog } from './AgentLoadsDialog';
import { TemplateDifferencesDialog } from './TemplateDifferencesDialog';

const offering = {
  uuid: 'offering-uuid',
  name: 'Alps',
  customer_uuid: 'customer-uuid',
  type: 'Marketplace.SiteAgent',
  agent_configuration: { order_processing_backend: 'slurm' },
  template_uuid: null,
  template_name: null,
  template_version: null,
} as any;

const fromTemplate = {
  ...offering,
  template_uuid: 'template-uuid',
  template_name: 'SLURM',
  template_version: 1,
};

const served = (backendSettings?: Record<string, unknown>) =>
  ({
    data: {
      offering: { backend_type: 'slurm', backend_settings: backendSettings },
      secrets: [
        {
          field: 'backend_settings.ldap.bind_password',
          backend: 'slurm',
          requirement: 'required_with_parent',
        },
      ],
      version: 'abc123',
    },
  }) as any;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(
    marketplaceProviderOfferingsSiteAgentConfigRetrieve,
  ).mockResolvedValue(served());
  vi.mocked(marketplaceServiceProvidersList).mockResolvedValue({
    data: [{ uuid: 'provider-uuid', customer_name: 'HPC Centre' }],
  } as any);
});

describe('AgentConfigurationActions', () => {
  it('opens what the agent loads', async () => {
    renderWithProviders(<AgentConfigurationActions offering={offering} />);
    await userEvent.click(screen.getByTestId('agent-loads-button'));
    expect(useModal().openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ resolve: { offering }, size: 'lg' }),
    );
  });

  it('offers the template differences only for an offering made from a template', async () => {
    const { unmount } = renderWithProviders(
      <AgentConfigurationActions offering={offering} />,
    );
    expect(
      screen.queryByTestId('template-differences-button'),
    ).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<AgentConfigurationActions offering={fromTemplate} />);
    await userEvent.click(screen.getByTestId('template-differences-button'));
    expect(useModal().openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ resolve: { offering: fromTemplate } }),
    );
  });
});

describe('AgentLoadsDialog', () => {
  const renderDialog = () =>
    renderWithProviders(<AgentLoadsDialog resolve={{ offering }} />);

  it('leaves out the secret of a block the offering does not configure', async () => {
    renderDialog();
    expect(await screen.findByText('abc123')).toBeInTheDocument();
    expect(
      screen.getByText('The backends in use need no secrets.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('backend_settings.ldap.bind_password'),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByTestId('agent-setup-generate'),
    ).toBeInTheDocument();
  });

  it('shows the secret of a configured block as needed', async () => {
    vi.mocked(
      marketplaceProviderOfferingsSiteAgentConfigRetrieve,
    ).mockResolvedValue(served({ ldap: { uri: 'ldap://ldap.example.com' } }));
    renderDialog();
    expect(await screen.findByText('abc123')).toBeInTheDocument();
    expect(
      screen.getByText('Required once its block is set'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('The backends in use need no secrets.'),
    ).not.toBeInTheDocument();
  });
});

describe('TemplateDifferencesDialog', () => {
  const renderDialog = () =>
    renderWithProviders(
      <TemplateDifferencesDialog resolve={{ offering: fromTemplate }} />,
    );

  it('shows the template and the drift from it', async () => {
    vi.mocked(
      marketplaceProviderOfferingsTemplateDiffRetrieve,
    ).mockResolvedValue({
      data: {
        template_uuid: 'template-uuid',
        template_name: 'SLURM',
        template_version: 1,
        latest_version: 2,
        created_version_differences: [
          {
            path: 'agent_configuration.backend_settings.qos_default',
            template: 'normal',
            offering: 'high',
          },
        ],
        latest_version_differences: [],
      },
    } as any);
    renderDialog();
    expect(
      await screen.findByText(
        'agent_configuration.backend_settings.qos_default',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('normal')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByTestId('template-drift-latest')).toHaveTextContent(
      'No differences.',
    );
  });

  it('leaves out the latest version of a template its reader cannot see', async () => {
    vi.mocked(
      marketplaceProviderOfferingsTemplateDiffRetrieve,
    ).mockResolvedValue({
      data: {
        template_uuid: 'template-uuid',
        template_name: 'SLURM',
        template_version: 1,
        latest_version: null,
        created_version_differences: [],
        latest_version_differences: null,
      },
    } as any);
    renderDialog();
    expect(
      await screen.findByTestId('template-drift-created'),
    ).toHaveTextContent('No differences.');
    expect(screen.queryByText('Latest version')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('template-drift-latest'),
    ).not.toBeInTheDocument();
  });
});
